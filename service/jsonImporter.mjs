'use strict';

import * as fs from 'node:fs';
import utf8 from 'utf8';
import * as dbService from './db.js';

export async function bulkImportChats(platform, chatFiles) {
  for (let chatFile of chatFiles) {
    let chatFilePath = path.join(inboxDir, chat, chatFile);
    await importSingleChat(chatFilePath, platform, chat, chatMediaPath);
    console.log(`Finish parsing ${chatFilePath}`);
    console.log(`Saving all multi-media files to disk`);
  }
}

export async function importSingleChat(
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

  let chatId = await dbService.insertNewChat(
    chatTitle,
    participantIds,
    platform
  );
  console.log('newly created chat:', chatId);
  dbService.importMsgStaging(
    messages,
    senderDic,
    chatId,
    platform,
    chatMediaPath
  );
  console.log('completed import session');
  dbService.closeRememberedDB();
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
      if (!(await dbService.checkContactExists(contactName))) {
        console.log(`inserting ${contactName} into DB`);
        participantId = await dbService.insertNewContact(contactName); // this is an array
        console.log('participantId:', participantId);
      } else {
        participantId = await dbService.getContactIdbyName(contactName);
        console.log(`Contact ${contactName} already exists`);
      }

      participantIds.push(participantId);
      /* save senderIds to dictionary to be used in future */
      senderDic[contactName] = participantId;
    }
  } else {
    // It is a 1-1 chat and user's name seems to be always the last, so only save the first one if it doesn't exist
    const contactName = contactNames[0];
    if (!(await dbService.checkContactExists(contactName))) {
      console.log(`inserting ${contactName} into DB`);

      participantId = await dbService.insertNewContact(contactName); // this is an array
      console.log('participantId:', participantId);
    } else {
      participantId = await dbService.getContactIdbyName(contactName);
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
