'use strict';

import sqlite3 from 'sqlite3';
import * as path from 'node:path';
import utf8 from 'utf8';
import {db, chatMemoryDir} from '../index.js';

class ChatStatus {
  static Active = new ChatStatus('active');
  static Archived = new ChatStatus('archived');

  constructor(name) {
    this.name = name;
  }
}

class MessageType {
  static Text = new ChatStatus('text');
  static Photo = new ChatStatus('photo');
  static Video = new ChatStatus('video');
  static Audio = new ChatStatus('audio');
  static Gif = new ChatStatus('gif');
  static Sticker = new ChatStatus('sticker');
  static Reaction = new ChatStatus('reaction');
  // Future types
  // static File = new ChatStatus(9);
  // static Post = new ChatStatus(10);
  // static Contact = new ChatStatus(11);
  // static Location = new ChatStatus(12);
  // static Poll = new ChatStatus(13);

  constructor(name) {
    this.name = name;
  }
}

export function createNewDatabase() {
  return new sqlite3.Database(path.join(chatMemoryDir, 'Data/remembered.db'), (err) => {
      if (err) {
        return console.log(err.message);
      }
      console.log('Successfully connected to remembered.db SQLite3 database.');
    });
}

// Create chats, contacts and message staging tables in the db
export function initializeDatabaseTables() {
  db.serialize(() => {
    db.run(
      `CREATE TABLE IF NOT EXISTS chats (
        id INTEGER PRIMARY KEY,
        created INTEGER NOT NULL,
        last_updated INTEGER NOT NULL,
        customTitle TEXT NOT NULL,
        participants TEXT NOT NULL,
        platforms TEXT NOT NULL,
        status INTEGER NOT NULL
      )`,
      (err) => {
        if (err) {
          console.log(err);
          throw err;
        }
      }
    );
    db.run(
      `CREATE TABLE IF NOT EXISTS contacts (
        id INTEGER PRIMARY KEY,
        created INTEGER NOT NULL,
        last_updated INTEGER NOT NULL,
        nickname TEXT NOT NULL
      )`,
      (err) => {
        if (err) {
          console.log(err);
          throw err;
        }
      }
    );
    db.run(
      `CREATE TABLE IF NOT EXISTS msgImportStaging (
      id INTEGER PRIMARY KEY,
      date_sent INTEGER NOT NULL,
      chat_id INTEGER NOT NULL,
      platform INTEGER NOT NULL,
      sender_id INTEGER NOT NULL,
      type INTEGER NOT NULL,
      reactions TEXT,
      text TEXT,
      media_uris TEXT
    )`,
      (err) => {
        if (err) {
          console.log(err);
          throw err;
        }
      }
    );
  });
}

export async function insertNewContact(contactName) {
  const query =
    'INSERT INTO contacts(created, last_updated, nickname) VALUES(?,?,?)';
  const values = [Date.now(), Date.now(), contactName];
  let promises = [];

  promises.push(
    new Promise((resolve, reject) => {
      db.run(query, values, function (error) {
        if (error) {
          console.log('##### ERROR insertNewContact:', error);
          reject(error);
        } else {
          console.log('id from insertNewContact:', this.lastID);
          resolve(this.lastID);
        }
      });
    })
  );

  return Promise.all(promises).then((values) => {
    return new Promise((resolve, reject) => {
      if (values.length > 0) {
        console.log('promises values:', values);
        resolve(values);
      } else {
        reject('##### ERROR: No contact was created from this file.');
      }
    });
  });
}

export async function insertNewChat(chatTitle, participantIds, platform) {
  const query =
    'INSERT INTO chats(created, last_updated, customTitle, participants, platforms, status) VALUES(?,?,?,?,?,?)';
  const values = [
    Date.now(),
    Date.now(),
    chatTitle,
    participantIds,
    platform,
    ChatStatus.Active.name,
  ];
  let promises = [];

  promises.push(
    new Promise((resolve, reject) => {
      db.run(query, values, function (error) {
        if (error) {
          console.log('##### ERROR insertNewChat:', error);
          reject(error);
        } else {
          console.log('id from insertNewChat:', this.lastID);
          resolve(this.lastID);
        }
      });
    })
  );

  return Promise.all(promises).then((values) => {
    return new Promise((resolve, reject) => {
      if (values.length > 0) {
        console.log('promises values:', values);
        resolve(values);
      } else {
        reject('##### ERROR: No chat was created from this file.');
      }
    });
  });
}

export async function importMsgStaging(messages, senderDic, chatId, platform) {
  for (let i = 0; i < messages.length; i++) {
    const message = messages[i];

    // IG & Messenger
    const senderName = utf8.decode(message.sender_name);
    const senderId =
      senderDic[senderName] != undefined ? senderDic[senderName] : 0;
    console.log(senderId);
    const dateSent = message.timestamp_ms;
    const content = message.content;

    /* detecting stickers */
    const sticker = message.sticker; // Messenger Sticker
    const stickerLink = message.share?.link; // Instagram Stickers
    const stickerOwner = message.share?.original_content_owner; // Verifies if is an Instagram Sticker

    const gifs = message.gifs; // Messenger only
    const audioFiles = message.audio_files;
    const videoFiles = message.videos;
    const photoFiles = message.photos;
    const unsent = message.is_unsent;

    // callback function
    const callbackFn = function (error, id) {
      if (error) {
        return console.log('##### ERROR:', error);
      }
      return id;
    };

    /* skip unsent messages - Messenger*/
    if (unsent) {
      continue;
    }

    /* get all reactions */
    const reactions = message.reactions;
    const reactionDic = {};
    const reactionArray = [];

    if (reactions != undefined) {
      for (let i = 0; i < reactions.length; i++) {
        const reaction = utf8.decode(reactions[i].reaction);
        const actor = utf8.decode(reactions[i].actor);

        if (reactionDic[actor] == reaction) {
          continue;
        }

        reactionDic[actor] = reaction;
        reactionArray.push(JSON.stringify(reactionDic));
      }
    }

    // checking for undefined: https://stackoverflow.com/questions/17150396/benefit-of-using-object-hasownproperty-vs-testing-if-a-property-is-undefined
    if (content != undefined) {
      /* Remove reactions - Instagram */
      if (content == 'Liked a message') {
        continue;
      }
      /* Remove reactions - Messenger */
      if (
        content.startsWith('Reacted') &&
        content.trim().endsWith('to your message')
      ) {
        continue;
      }

      const decodedText = utf8.decode(content); // decodes symbols and emojis
      await insertNewMessage(
        dateSent,
        chatId,
        platform,
        senderId,
        MessageType.Text.name,
        reactionArray,
        decodedText,
        null,
        callbackFn
      );
    } else if (
      sticker != undefined ||
      (stickerLink != undefined && stickerOwner != undefined)
    ) {
      if (sticker != undefined) {
        /* Messenger */
        const stickerUri = sticker.uri;
        await insertNewMessage(
          dateSent,
          chatId,
          platform,
          senderId,
          MessageType.Sticker.name,
          reactionArray,
          null,
          stickerUri,
          callbackFn
        );
      } else if (stickerLink != undefined && stickerOwner != undefined) {
        /* Instagram*/
        await insertNewMessage(
          dateSent,
          chatId,
          platform,
          senderId,
          MessageType.Sticker.name,
          reactionArray,
          null,
          stickerLink,
          callbackFn
        );
      }
    } else if (audioFiles != undefined) {
      // currently each of the media loops creates a new message row for each file. This needs to be refactored to properly support multiple files
      for (let i = 0; i < audioFiles.length; i++) {
        const audioUri = audioFiles[i].uri;
        await insertNewMessage(
          dateSent,
          chatId,
          platform,
          senderId,
          MessageType.Audio.name,
          reactionArray,
          null,
          audioUri,
          callbackFn
        );
      }
    } else if (videoFiles != undefined) {
      for (let i = 0; i < videoFiles.length; i++) {
        const videoUri = videoFiles[i].uri;
        await insertNewMessage(
          dateSent,
          chatId,
          platform,
          senderId,
          MessageType.Video.name,
          reactionArray,
          null,
          videoUri,
          callbackFn
        );
      }
    } else if (photoFiles != undefined) {
      for (let i = 0; i < photoFiles.length; i++) {
        const photoUri = photoFiles[i].uri;
        await insertNewMessage(
          dateSent,
          chatId,
          platform,
          senderId,
          MessageType.Photo.name,
          reactionArray,
          null,
          photoUri,
          callbackFn
        );
      }
    } else if (gifs != undefined) {
      for (let i = 0; i < gifs.length; i++) {
        const gifUri = gifs[i].uri;
        await insertNewMessage(
          dateSent,
          chatId,
          platform,
          senderId,
          MessageType.Gif.name,
          reactionArray,
          null,
          gifUri,
          callbackFn
        );
      }
    } else {
      await insertNewMessage(
        dateSent,
        chatId,
        platform,
        senderId,
        '##### unknown ######',
        reactionArray,
        '################## ?? ##################',
        null,
        callbackFn
      );
    }
  }
}

async function insertNewMessage(
  dateSent,
  chatId,
  platform,
  senderId,
  type,
  reactions,
  text,
  mediaUri,
  callback
) {
  const query =
    'INSERT INTO msgImportStaging(date_sent, chat_id, platform, sender_id, type, reactions, text, media_uris) VALUES(?,?,?,?,?,?,?,?)';
  const values = [
    dateSent,
    chatId,
    platform,
    senderId,
    type,
    reactions,
    text,
    mediaUri,
  ];

  db.run(query, values, function (error) {
    callback(error, this.lastID);
  });
}