import * as fs from 'node:fs';
import utf8 from 'utf8';
import * as path from 'node:path';

import * as dbService from './db.js';
import * as index from '../master.js';
import * as K from '../util/constants.js';

export async function importSingleChat(
  chatTitle,
  messengerChatID,
  instagramChatID,
  chatMediaPath,
  chatFilePaths
) {
  console.log('%%% Starting import of the following chat %%%');
  console.log('chatTitle:', chatTitle);
  console.log('chatMediaPath:', chatMediaPath);
  // console.log('chatFilePaths:', chatFilePaths);

  let allUniqueParticipants = new Set();
  let allMessages = [];

  /* Loop to support if there is more than one chat file to import */
  for (let chatFile of chatFilePaths) {
    console.log('processing chatFile:', chatFile);

    let rawData = await fs.promises.readFile(chatFile);
    let parsedFile = JSON.parse(rawData);
    let messages = parsedFile.messages;

    /* push participants to set */
    let participants = parsedFile.participants;
    // console.log('participants:', participants);

    for (let participant of participants) {
      allUniqueParticipants.add(utf8.decode(participant.name));
    }

    /* push messages into array */
    allMessages.push(...messages);
  }

  console.log('allUniqueParticipants:', allUniqueParticipants);
  console.log('allMessages.length:', allMessages.length);

  const { contactIds, senderDic } = await createMatchContacts(
    Array.from(allUniqueParticipants)
  );

  // console.log('contactIds:', contactIds);
  // console.log('senderDic', senderDic);

  let chatId = await dbService.insertNewChat(
    chatTitle,
    messengerChatID,
    instagramChatID,
    contactIds,
    index.chatPlatform
  );
  console.log('newly created chat:', chatId);

  importMsgStaging(
    allMessages,
    senderDic,
    chatId,
    index.chatPlatform,
    chatMediaPath
  );
  console.log('completed import session');
}

async function createMatchContacts(participants) {
  console.log('%%% Start creating/matching of Contacts %%%');

  let contactIds = [];
  let senderDic = {};
  const numOfParticipants = participants.length;

  if (numOfParticipants > 2) {
    let contactId = 0;

    // It is a group chat
    for (const contactName of participants) {
      console.log('processing participant:', contactName);
      if (!(await dbService.checkContactExists(contactName))) {
        // console.log(`inserting ${contactName} into DB`);
        contactId = await dbService.insertNewContact(contactName); // returned value is an array of one element
        // console.log('contactId:', contactId);
      } else {
        // console.log(`Contact ${contactName} already exists`);
        contactId = await dbService.getContactIdbyName(contactName);
      }

      contactIds.push(contactId);
      senderDic[contactName] = contactId;
    }
  } else {
    let contactId = 0;

    // It is a 1-1 chat and user's name seems to be always the last, so only save the first one if it doesn't exist
    const contactName = participants[0];
    if (!(await dbService.checkContactExists(contactName))) {
      // console.log(`inserting ${contactName} into DB`);
      contactId = await dbService.insertNewContact(contactName); // returned value is an array of one element
      // console.log('contactId:', contactId);
    } else {
      // console.log(`Contact ${contactName} already exists`);
      contactId = await dbService.getContactIdbyName(contactName);
    }

    contactIds.push(contactId);
    senderDic[contactName] = contactId;
  }

  return {
    contactIds,
    senderDic,
  };
}

export async function importMsgStaging(
  messages,
  senderDic,
  chatId,
  platform,
  chatMediaPath
) {
  console.log('%%% Starting import of messages into Staging DB %%%');
  for (let i = 0; i < messages.length; i++) {
    const message = messages[i];

    // IG & Messenger
    const senderName = utf8.decode(message.sender_name);
    const senderId =
      senderDic[senderName] !== undefined ? senderDic[senderName] : 0;
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

    if (reactions !== undefined) {
      for (let i = 0; i < reactions.length; i++) {
        const reaction = utf8.decode(reactions[i].reaction);
        const actor = utf8.decode(reactions[i].actor);

        if (reactionDic[actor] === reaction) {
          continue;
        }

        reactionDic[actor] = reaction;
        reactionArray.push(JSON.stringify(reactionDic));
      }
    }

    // checking for undefined: https://stackoverflow.com/questions/17150396/benefit-of-using-object-hasownproperty-vs-testing-if-a-property-is-undefined
    if (content !== undefined) {
      /* Remove reactions - Instagram */
      if (content === 'Liked a message') {
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
      const textMessage = K.MessageType.Text;
      await dbService.insertNewMessage(
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
      sticker !== undefined ||
      (stickerLink !== undefined && stickerOwner !== undefined)
    ) {
      if (sticker !== undefined) {
        /* Messenger */
        const stickerUri = sticker.uri;
        const stickerMessage = K.MessageType.Sticker;
        await dbService.insertNewMessage(
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
      } else if (stickerLink !== undefined && stickerOwner !== undefined) {
        const stickerMessage = K.MessageType.Sticker;
        /* Instagram*/
        await dbService.insertNewMessage(
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
    } else if (audioFiles !== undefined) {
      // currently each of the media loops creates a new message row for each file. This needs to be refactored to properly support multiple files
      for (let i = 0; i < audioFiles.length; i++) {
        const originalAudioUri = path.join(
          index.importDataPath,
          audioFiles[i].uri
        );
        const newAudioUri = path.join(
          chatMediaPath,
          'audio',
          path.basename(originalAudioUri)
        );
        fs.copyFile(originalAudioUri, newAudioUri, (err) => {
          if (err) {
            console.error(
              `Can't copy audio file ${originalAudioUri} over`,
              err
            );
          }
        });

        const audioMessage = K.MessageType.Audio;
        await dbService.insertNewMessage(
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
    } else if (videoFiles !== undefined) {
      for (let i = 0; i < videoFiles.length; i++) {
        const originalVideoUri = path.join(
          index.importDataPath,
          videoFiles[i].uri
        );
        const newVideoUri = path.join(
          chatMediaPath,
          'videos',
          path.basename(originalVideoUri)
        );
        fs.copyFile(originalVideoUri, newVideoUri, (err) => {
          if (err) {
            console.error(
              `Can't copy video file ${originalVideoUri} over`,
              err
            );
          }
        });

        const videoMessage = K.MessageType.Video;
        await dbService.insertNewMessage(
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
    } else if (photoFiles !== undefined) {
      for (let i = 0; i < photoFiles.length; i++) {
        const originalPhotoUri = path.join(
          index.importDataPath,
          photoFiles[i].uri
        );
        const newPhotoUri = path.join(
          chatMediaPath,
          'photos',
          path.basename(originalPhotoUri)
        );
        fs.copyFile(originalPhotoUri, newPhotoUri, (err) => {
          if (err) {
            console.error(
              `Can't copy video file ${originalPhotoUri} over`,
              err
            );
          }
        });

        const photoMessage = K.MessageType.Photo;
        await dbService.insertNewMessage(
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
    } else if (gifs !== undefined) {
      for (let i = 0; i < gifs.length; i++) {
        const gifUri = gifs[i].uri;
        const gifMessage = K.MessageType.Gif;
        await dbService.insertNewMessage(
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
      await dbService.insertNewMessage(
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
