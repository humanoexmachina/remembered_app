'use strict';

import sqlite3 from 'sqlite3';
import * as path from 'node:path';
import { db, appDataDir } from '../index.js';
import * as constants from '../util/constants.js';

export function connectRememberedDB() {
  return new sqlite3.Database(path.join(appDataDir, 'remembered.db'), (err) => {
    if (err) {
      console.log(err.message);
      return;
    }
    console.log('Successfully connected to remembered.db SQLite3 database.');
  });
}

export function closeRememberedDB() {
  db.close((err) => {
    if (err) {
      console.error(err.message);
    }
    console.log('Successfully closed the database connection.');
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
        messengerChatID TEXT NOT NULL,
        instagramChatID TEXT NOT NULL,
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
        // console.log(`Contact ${contactName} exists?: ${result['ifexists']}`);
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
        // console.log(`Contact ${contactName}'s Id is: ${row.contactId}`);
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
          // console.log('id from insertNewContact:', this.lastID);
          resolve(this.lastID);
        }
      });
    })
  );

  return Promise.all(promises).then((values) => {
    return new Promise((resolve, reject) => {
      if (values.length > 0) {
        resolve(values[0]);
      } else {
        reject('##### ERROR: No contact was created from this file.');
      }
    });
  });
}

export async function insertNewChat(chatTitle, messengerChatID, instagramChatID, participantIds, platform) {
  const query =
    'INSERT INTO chats(created, last_updated, customTitle, messengerChatID, instagramChatID, participants, platforms, status) VALUES(?,?,?,?,?,?,?,?)';
  const activeStatus = constants.ChatStatus.Active;
  const values = [
    Date.now(),
    Date.now(),
    chatTitle,
    messengerChatID,
    instagramChatID,
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
          // console.log('id from insertNewChat:', this.lastID);
          resolve(this.lastID);
        }
      });
    })
  );

  return Promise.all(promises).then((values) => {
    return new Promise((resolve, reject) => {
      if (values.length > 0) {
        // console.log('promises values:', values);
        resolve(values);
      } else {
        reject('##### ERROR: No chat was created from this file.');
      }
    });
  });
}

export async function insertNewMessage(
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
