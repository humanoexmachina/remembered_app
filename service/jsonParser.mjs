'use strict';

import * as fs from 'node:fs';
import utf8 from 'utf8';
import {insertNewContact, insertNewChat, importMsgStaging} from './db.js';

/* enums: https://www.sohamkamani.com/javascript/enums/ */

/* Import Session Attributes */
let participantIds = [];
let senderDic = {};
let chatId = null;

export async function loadFile(chatFilePath, platform, chatTitle) {

  let rawData = await fs.promises.readFile(chatFilePath);
  let parsedFile = JSON.parse(rawData);
  let participants = parsedFile.participants;
  let messages = parsedFile.messages;

  participantIds.push(await getParticipants(participants));
  chatId = await insertNewChat(chatTitle, participantIds, platform);
  console.log('newly created chat:', chatId);
  importMsgStaging(messages, senderDic, chatId, platform);
}

async function getParticipants(participants) {
  let participantIds = [];

  for (let i = 0; i < participants.length; i++) {
    const contactName = utf8.decode(participants[i].name);
    console.log(contactName);

    if (i < participants.length - 1) {
      console.log(`inserting ${contactName} into DB`);

      const participantId = await insertNewContact(contactName); // this is an array
      console.log('participantId:', participantId);
      participantIds.push(...participantId);

      /* save senderIds to dictionary to be used in future */
      senderDic[contactName] = participantId[0];
    }
  }
  console.log('senderDic:', senderDic);
  console.log('final participantIds:', participantIds);
  return participantIds;
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
