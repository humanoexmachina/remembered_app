'use strict';

import * as fs from 'node:fs';
import utf8 from 'utf8';
import {
  insertNewContact,
  insertNewChat,
  importMsgStaging,
  checkContactExists,
  getContactIdbyName,
} from './db.js';

export async function loadFile(
  chatFilePath,
  platform,
  chatTitle,
  chatMediaPath
) {
  let rawData = await fs.promises.readFile(chatFilePath);
  let parsedFile = JSON.parse(rawData);
  let participants = parsedFile.participants;
  let messages = parsedFile.messages;

  const { participantIds, senderDic } = await getParticipants(participants);

  let chatId = await insertNewChat(chatTitle, participantIds, platform);
  console.log('newly created chat:', chatId);
  importMsgStaging(messages, senderDic, chatId, platform, chatMediaPath);
}

async function getParticipants(participants) {
  let participantIds = [];
  let participantId = 0;
  let senderDic = {};
  const numOfParticipants = participants.length;
  const contactNames = participants.map((participant) =>
    utf8.decode(participant.name)
  );

  if (numOfParticipants > 2) {
    // It is a group chat
    for (const contactName of contactNames) {
      if (!(await checkContactExists(contactName))) {
        console.log(`inserting ${contactName} into DB`);
        participantId = await insertNewContact(contactName); // this is an array
        console.log('participantId:', participantId);
      } else {
        participantId = await getContactIdbyName(contactName);
        console.log(`Contact ${contactName} already exists`);
      }

      participantIds.push(participantId);
      /* save senderIds to dictionary to be used in future */
      senderDic[contactName] = participantId;
    }
  } else {
    // It is a 1-1 chat and user's name seems to be always the last, so only save the first one if it doesn't exist
    const contactName = contactNames[0];
    if (!(await checkContactExists(contactName))) {
      console.log(`inserting ${contactName} into DB`);

      participantId = await insertNewContact(contactName); // this is an array
      console.log('participantId:', participantId);
    } else {
      participantId = await getContactIdbyName(contactName);
    }

    participantIds.push(participantId);
    /* save senderIds to dictionary to be used in future */
    senderDic[contactName] = participantId;
  }

  console.log('senderDic:', senderDic);
  console.log('final participantIds:', participantIds);
  return {
    participantIds,
    senderDic,
  };
}
