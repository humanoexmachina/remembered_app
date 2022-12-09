'use strict';

import * as fs from 'node:fs';
import utf8 from 'utf8';
import sqlite3 from 'sqlite3';

/* enums: https://www.sohamkamani.com/javascript/enums/ */
class Platform {
  static Messenger = new Platform('messenger');
  static Instagram = new Platform('instagram');

  constructor(name) {
    this.name = name;
  }
}

class ChatStatus {
  static Active = new ChatStatus('active');
  static Archived = new ChatStatus('archived');

  constructor(name) {
    this.name = name;
  }
}

class MessageType {
  static Text = new ChatStatus('text');
  static Link = new ChatStatus('link');
  static Photo = new ChatStatus('photo');
  static Video = new ChatStatus('video');
  static Audio = new ChatStatus('audio');
  static Gif = new ChatStatus('gif');
  static Sticker = new ChatStatus('sticker');
  static Reaction = new ChatStatus('reaction');
  // static File = new ChatStatus(9);
  // static Post = new ChatStatus(10);
  // static Contact = new ChatStatus(11);
  // static Location = new ChatStatus(12);
  // static Poll = new ChatStatus(13);

  constructor(name) {
    this.name = name;
  }
}

/* Import Session Attributes */
let filePath =
  '../files/arainyspringday_20221207/messages/inbox/taei_1026691105399047/message_1.json';
let platform = Platform.Instagram.name;
let chatTitle = 'taei';
let messages = null;
let participantIds = [];
let chatId = null;

/* Open Database */
let db = new sqlite3.Database('../data/remembered.db', (err) => {
  if (err) {
    return console.log(err.message);
  }
  console.log('Successfully connected to remembered.db SQLite3 database.');
});

initializeDatabaseTables();

loadFile();

async function loadFile() {
  let rawData = await fs.promises.readFile(filePath);
  let parsedFile = JSON.parse(rawData);
  let participants = parsedFile.participants;
  messages = parsedFile.messages;

  participantIds.push(await getParticipants(participants));
  chatId = await insertNewChat();
  console.log('newly created chat:', chatId);
  importMsgStaging();
}

async function getParticipants(participants) {
  let participantIds = [];

  for (let i = 0; i < participants.length; i++) {
    const contactName = utf8.decode(participants[i].name);
    console.log(contactName);

    if (i < participants.length - 1) {
      console.log(`inserting ${contactName} into DB`);

      const participantId = await insertNewContact(contactName);
      console.log('participantId:', participantId);
      participantIds.push(...participantId);
    }
  }

  console.log('final participantIds:', participantIds);
  return participantIds;
}

async function importMsgStaging() {
  for (let i = 0; i < messages.length; i++) {
    const message = messages[i];

    // Message Attributes
    const sender = utf8.decode(message.sender_name);
    const dateSent = message.timestamp_ms;
    const content = message.content;
    const audioFiles = message.audio_files;
    const videoFiles = message.videos;
    const photoFiles = message.photos;

    // callback function
    const callbackFn = function (error, id) {
      if (error) {
        return console.log('##### ERROR:', error);
      }
      return id;
    };

    /* get all reactions */
    const reactions = message.reactions;
    const reactionDic = {};
    const reactionArray = [];

    if (reactions != undefined) {
      for (let i = 0; i < reactions.length; i++) {
        const reaction = utf8.decode(reactions[i].reaction);
        const actor = utf8.decode(reactions[i].actor);

        if (reactionDic[actor] == reaction) {
          console.log('match?', reactionDic[actor] == reaction);
          continue;
        }

        reactionDic[actor] = reaction;
        console.log('reactionDic:', reactionDic);

        reactionArray.push(JSON.stringify(reactionDic));
        console.log('reactionArray', reactionArray);
      }
    }

    // checking for undefined: https://stackoverflow.com/questions/17150396/benefit-of-using-object-hasownproperty-vs-testing-if-a-property-is-undefined
    if (content != undefined) {
      if (content == 'Liked a message') {
        continue;
      }

      const decodedText = utf8.decode(content); // decodes symbols and emojis
      await insertNewMessage(
        dateSent,
        chatId,
        platform,
        sender,
        MessageType.Text.name,
        reactionArray,
        decodedText,
        null,
        null,
        callbackFn
      );
    } else if (audioFiles != undefined) {
      // currently each of the media loops creates a new message row for each file. This needs to be refactored to properly support multiple files
      for (let i = 0; i < audioFiles.length; i++) {
        const audioUri = audioFiles[i].uri;
        await insertNewMessage(
          dateSent,
          chatId,
          platform,
          sender,
          MessageType.Audio.name,
          reactionArray,
          null,
          audioUri,
          null,
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
          sender,
          MessageType.Video.name,
          reactionArray,
          null,
          videoUri,
          null,
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
          sender,
          MessageType.Photo.name,
          reactionArray,
          null,
          photoUri,
          null,
          callbackFn
        );
      }
    } else {
      await insertNewMessage(
        dateSent,
        chatId,
        platform,
        sender,
        '##### unknown ######',
        reactionArray,
        '################## ?? ##################',
        null,
        null,
        callbackFn
      );
    }
  }
}

function initializeDatabaseTables() {
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
      media_uris TEXT,
      link_url TEXT
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

async function insertNewMessage(
  dateSent,
  chatId,
  platform,
  senderId,
  type,
  reactions,
  text,
  mediaUri,
  linkUrl,
  callback
) {
  const query =
    'INSERT INTO msgImportStaging(date_sent, chat_id, platform, sender_id, type, reactions, text, media_uris, link_url) VALUES(?,?,?,?,?,?,?,?,?)';
  const values = [
    dateSent,
    chatId,
    platform,
    senderId,
    type,
    reactions,
    text,
    mediaUri,
    linkUrl,
  ];

  db.run(query, values, function (error) {
    callback(error, this.lastID);
  });
}

async function insertNewContact(contactName) {
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

async function insertNewChat() {
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

// 3rd operation (retrieve data from users table)
// db.each(`SELECT email FROM users`, (err, row) => {
//   if (err) {
//     console.log(err);
//     throw err;
//   }
//   console.log(row.email);
// }, () => {
//   console.log('query completed')
// });

/* Close the database */
// db.close((err) => {
//   if (err) {
//     return console.error(err.message);
//   }
//   console.log('Closed the database connection.');
// });
