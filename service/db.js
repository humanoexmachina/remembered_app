'use strict';

import sqlite3 from 'sqlite3';
import * as path from 'node:path';
import utf8 from 'utf8';
import { db, chatMemoryDir, chatHistoryDir } from '../index.js';
import * as constants from '../util/constants.js';
import * as fs from 'node:fs';

export function createNewDatabase() {
  return new sqlite3.Database(
    path.join(chatMemoryDir, 'Data/remembered.db'),
    (err) => {
      if (err) {
        return console.log(err.message);
      }
      console.log('Successfully connected to remembered.db SQLite3 database.');
    }
  );
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
        nickname TEXT NOT NULL,
        profilePicture TEXT
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

export async function checkContactExists(contactName) {
  const query = `SELECT EXISTS(SELECT 1 FROM contacts WHERE nickname LIKE ? LIMIT 1) as ifexists`;

  return new Promise((resolve, reject) => {
    db.get(query, [contactName], (err, result) => {
      if (err) {
        reject(err);
      } else {
        console.log(`Contact ${contactName} exists: ${result['ifexists']}`);
        resolve(result['ifexists']);
      }
    });
  });
}

export async function getContactIdbyName(contactName) {
  const query = `SELECT Id contactId FROM contacts WHERE nickname LIKE ? LIMIT 1`;

  return new Promise((resolve, reject) => {
    db.get(query, [contactName], (err, row) => {
      if (err) {
        reject(err);
      } else {
        console.log(`Contact ${contactName}'s Id is: ${row.contactId}`);
        resolve(row.contactId);
      }
    });
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
        resolve(values[0]);
      } else {
        reject('##### ERROR: No contact was created from this file.');
      }
    });
  });
}

export async function insertNewChat(chatTitle, participantIds, platform) {
  const query =
    'INSERT INTO chats(created, last_updated, customTitle, participants, platforms, status) VALUES(?,?,?,?,?,?)';
  const activeStatus = constants.ChatStatus.Active;
  const values = [
    Date.now(),
    Date.now(),
    chatTitle,
    participantIds,
    platform,
    activeStatus,
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

export async function importMsgStaging(
  messages,
  senderDic,
  chatId,
  platform,
  chatMediaPath
) {
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
      const textMessage = constants.MessageType.Text;
      await insertNewMessage(
        dateSent,
        chatId,
        platform,
        senderId,
        textMessage,
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
        const stickerMessage = constants.MessageType.Sticker;
        await insertNewMessage(
          dateSent,
          chatId,
          platform,
          senderId,
          stickerMessage,
          reactionArray,
          null,
          stickerUri,
          callbackFn
        );
      } else if (stickerLink != undefined && stickerOwner != undefined) {
        const stickerMessage = constants.MessageType.Sticker;
        /* Instagram*/
        await insertNewMessage(
          dateSent,
          chatId,
          platform,
          senderId,
          stickerMessage,
          reactionArray,
          null,
          stickerLink,
          callbackFn
        );
      }
    } else if (audioFiles != undefined) {
      // currently each of the media loops creates a new message row for each file. This needs to be refactored to properly support multiple files
      for (let i = 0; i < audioFiles.length; i++) {
        const originalAudioUri = path.join(chatHistoryDir, audioFiles[i].uri);
        const newAudioUri = path.join(
          chatMediaPath,
          'audio',
          path.basename(originalAudioUri)
        );
        await fs.copyFile(originalAudioUri, newAudioUri, (err) => {
          if (err) {
            console.error(
              `Can't copy audio file ${originalAudioUri} over`,
              err
            );
          }
        });

        const audioMessage = constants.MessageType.Audio;
        await insertNewMessage(
          dateSent,
          chatId,
          platform,
          senderId,
          audioMessage,
          reactionArray,
          null,
          newAudioUri,
          callbackFn
        );
      }
    } else if (videoFiles != undefined) {
      for (let i = 0; i < videoFiles.length; i++) {
        const originalVideoUri = path.join(chatHistoryDir, videoFiles[i].uri);
        const newVideoUri = path.join(
          chatMediaPath,
          'videos',
          path.basename(originalVideoUri)
        );
        await fs.copyFile(originalVideoUri, newVideoUri, (err) => {
          if (err) {
            console.error(
              `Can't copy video file ${originalVideoUri} over`,
              err
            );
          }
        });

        const videoMessage = constants.MessageType.Video;
        await insertNewMessage(
          dateSent,
          chatId,
          platform,
          senderId,
          videoMessage,
          reactionArray,
          null,
          newVideoUri,
          callbackFn
        );
      }
    } else if (photoFiles != undefined) {
      for (let i = 0; i < photoFiles.length; i++) {
        const originalPhotoUri = path.join(chatHistoryDir, photoFiles[i].uri);
        const newPhotoUri = path.join(
          chatMediaPath,
          'photos',
          path.basename(originalPhotoUri)
        );
        await fs.copyFile(originalPhotoUri, newPhotoUri, (err) => {
          if (err) {
            console.error(
              `Can't copy video file ${originalPhotoUri} over`,
              err
            );
          }
        });

        const photoMessage = constants.MessageType.Photo;
        await insertNewMessage(
          dateSent,
          chatId,
          platform,
          senderId,
          photoMessage,
          reactionArray,
          null,
          newPhotoUri,
          callbackFn
        );
      }
    } else if (gifs != undefined) {
      for (let i = 0; i < gifs.length; i++) {
        const gifUri = gifs[i].uri;
        const gifMessage = constants.MessageType.Gif;
        await insertNewMessage(
          dateSent,
          chatId,
          platform,
          senderId,
          gifMessage,
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
