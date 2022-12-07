'use strict';

import * as fs from 'node:fs';
import utf8 from 'utf8';
import sqlite3 from 'sqlite3';
import { resolve } from 'node:path';

/* enums: https://www.sohamkamani.com/javascript/enums/ */
class Platform {
  static Messenger = new Platform(1)
  static Instagram = new Platform(2)

  constructor(name) {
    this.name = name
  }
}

class ChatStatus {
  static Live = new ChatStatus(1)
  static Archived = new ChatStatus(2)

  constructor(name) {
    this.name = name
  }
}

class MessageType {
  static Text = new ChatStatus(1)
  static Audio = new ChatStatus(2)
  static Photo = new ChatStatus(3)
  static Video = new ChatStatus(4)
  static File = new ChatStatus(5)
  static Gif = new ChatStatus(6)
  static Sticker = new ChatStatus(7)
  static Reaction = new ChatStatus(8)
  static Share_post = new ChatStatus(9)
  static Share_contact = new ChatStatus(10)

  constructor(name) {
    this.name = name
  }
}

/* Open Database */
let db = new sqlite3.Database('../data/remembered.db', (err) => {
  if (err) {
    return console.log(err.message);
  }
  console.log('Successfully connected to remembered.db SQLite3 database.');
});

initializeDatabaseTables()

loadFile('../files/arainyspringday_20221205/messages/inbox/graceandminyoungan_98otlxnfta/message_1.json', Platform.Instagram.name, "graceandminyoungan_98otlxnfta");

async function loadFile(filePath, platform, chatTitle) {
  let rawData = await fs.promises.readFile(filePath);
  let parsedFile = JSON.parse(rawData);
  let participants = parsedFile.participants;
  let messages = parsedFile.messages;
  const finalChatParticipants = await getParticipants(participants, platform);
  console.log('finalChatParticipants outside:', finalChatParticipants);
  const chatId = await insertNewChat(chatTitle, finalChatParticipants, platform);
  console.log('newly created chat:', chatId)
  getMessages(messages);
};
   
async function getParticipants(participants, platform) {
  console.log('the current platform is:', platform)
  let participantIds = []

  for (let i = 0; i < participants.length; i++) {
    const contactName = utf8.decode(participants[i].name);
    console.log(contactName)

    if (i < participants.length - 1) {
      console.log(`inserting ${contactName} into DB`)

      const participantId = await insertNewContact(contactName)
      console.log('participantId:', participantId)
      participantIds.push(...participantId)
    }
  }

  console.log('final participantIds:', participantIds)
  return participantIds

  /* get all the newly created participant IDs and then return them in an array of values */
  // return Promise.all(promises).then((values) => {
  //   console.log('final promises values:', values)
  //   return new Promise((resolve, reject) => {
  //     if (values.length > 0) {
  //       resolve(values)
  //     } else {
  //       reject('##### ERROR: No participants were found for this chat file.')
  //     }
  //   })
  // })
};

function getMessages(messages) {
  for (let i = 0; i < messages.length; i++) {
    const message = messages[i];
    const type = message.type;

    switch (type) {
      case 'Generic':
        const text = message.content;
        const audioFiles = message.audio_files;
        const videoFiles = message.videos;
        const photoFiles = message.photos;

        if (text != null) {
          const decodedText = utf8.decode(text); // decodes symbols and emojis
          // console.log(decodedText);
        } else {
          if (audioFiles != null) {
            // console.log(audioFiles[0].uri);
          } else if (videoFiles != null) {
            // console.log(videoFiles[0].uri);
          } else if (photoFiles != null) {
            // console.log(photoFiles[0].uri);
          } else {
            // console.log('no matching format');
          }
        }
        break;
      case 'Share':
        console.log(message.share.link);
        break;
    }
  }
};

function initializeDatabaseTables() {
  db.serialize(() => {
    db.run(`CREATE TABLE IF NOT EXISTS chats (
        id INTEGER PRIMARY KEY,
        created INTEGER NOT NULL,
        last_updated INTEGER NOT NULL,
        customTitle TEXT NOT NULL,
        participants TEXT NOT NULL,
        platforms TEXT NOT NULL,
        status INTEGER NOT NULL
      )`, (err) => {
      if (err) {
        console.log(err);
        throw err;
      }
    });
    db.run(`CREATE TABLE IF NOT EXISTS contacts (
        id INTEGER PRIMARY KEY,
        created INTEGER NOT NULL,
        last_updated INTEGER NOT NULL,
        nickname TEXT NOT NULL
      )`, (err) => {
      if (err) {
        console.log(err);
        throw err;
      }
    });
    db.run(`CREATE TABLE IF NOT EXISTS messages (
      id INTEGER PRIMARY KEY,
      date_sent INTEGER NOT NULL,
      chat_id INTEGER NOT NULL,
      platform INTEGER NOT NULL,
      sender_id INTEGER NOT NULL,
      type INTEGER NOT NULL,
      text TEXT NOT NULL,
      media_uri TEXT NOT NULL
    )`, (err) => {
    if (err) {
      console.log(err);
      throw err;
    }
  });
  });
}

async function insertNewContact(contactName) {
  const query = 'INSERT INTO contacts(created, last_updated, nickname) VALUES(?,?,?)'
  const values = [Date.now(), Date.now(), contactName]
  let promises = []

  promises.push(new Promise((resolve, reject) => {
    db.run(query, values, function(error) {
      if (error) {
        console.log('##### ERROR:', error)
        reject(error)
      } else {
        console.log('id from insertNewContact inside:', this.lastID)
        resolve(this.lastID)
      }
    });
  }))

  return Promise.all(promises).then((values) => {
    return new Promise((resolve, reject) => {
      if (values.length > 0) {
        console.log('promises values:', values)
        resolve(values)
      } else {
        reject('##### ERROR: No contact was created from this file.')
      }
    })
  })
  
}

async function insertNewChat(chatTitle, participants, platform) {
  const query = 'INSERT INTO chats(created, last_updated, customTitle, participants, platforms, status) VALUES(?,?,?,?,?,?)'
  const values = [Date.now(), Date.now(), chatTitle, participants, platform, 1]
  let promises = []

  promises.push(new Promise((resolve, reject) => {
    db.run(query, values, function(error) {
      if (error) {
        console.log('##### ERROR:', error)
        reject(error)
      } else {
        console.log('id from insertNewChat inside:', this.lastID)
        resolve(this.lastID)
      }
    })
  }))    

  return Promise.all(promises).then((values) => {
    return new Promise((resolve, reject) => {
      if (values.length > 0) {
        console.log('promises values:', values)
        resolve(values)
      } else {
        reject('##### ERROR: No chat was created from this file.')
      }
    })
  })

};

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