'use strict';

import * as K from '../util/constants.js';
import * as index from '../index.js';

import * as fs from 'node:fs';
import * as path from 'node:path';
import AdmZip, * as admZip from 'adm-zip';
import getFolderSize from 'get-folder-size';
import { isNotJunk } from 'junk';

export function unZip() {
  // check if the chat history is a zip file or folder
  const chatHistoryStats = fs.statSync(index.userImportedFilePath);

  if (
    chatHistoryStats.isFile() &&
    path.extname(index.userImportedFilePath) == `.zip`
  ) {
    // users uploaded a zip file
    console.log(`Detected a zip file`);

    // create directory
    const decompressPath = path.join(index.appDataDir, Date.now().toString());
    fs.mkdirSync(decompressPath, { recursive: true });
    console.log(`created ${decompressPath}`);
    // unzip the file
    const chatZip = new AdmZip(index.userImportedFilePath);
    chatZip.extractAllTo(decompressPath);

    // return the new path to the new decompressed folder
    return decompressPath;
  } else if (chatHistoryStats.isDirectory()) {
    // users uploaded a chat history directory
    console.log(`Users uploaded a chat history directory`);
    return index.userImportedFilePath;
  } else {
    throw new Error(
      `Please upload the original chat history file downloaded from chat apps`
    );
  }
}

/* currently not being used
export function detectPlatform(chatHistoryPath) {
  // Determine the source of the chat history
  if (fs.existsSync(path.join(chatHistoryPath, `past_instagram_insights`))) {
    // chat history is from Instagram
    console.log('Chat history is from Instagram');
    chatPlatform = ChatPlatform.Instagram;
  } else if (fs.existsSync(path.join(chatHistoryPath, `messages`))) {
    // chat history is from Messenger
    console.log('Chat history is from Messenger');
    chatPlatform = ChatPlatform.Messenger;
  } else {
    throw new Error('Seems like there is no chat history to be read');
  }
}
*/

export function validateChatFolder() {
  switch (index.chatPlatform) {
    case K.ChatPlatform.Instagram:
    case K.ChatPlatform.Messenger:
      const inboxDir = path.join(index.importDataPath, `messages/inbox`);

      if (fs.existsSync(inboxDir)) {
        return inboxDir;
      } else {
        throw '##### ERROR: Chat folder was not found!';
      }
      break;
  }
}

export function createStorageLocations() {
  // Create media folder
  let newchatMediaDir = path.join(index.appDataDir, `Media`);

  if (!fs.existsSync(newchatMediaDir)) {
    fs.mkdirSync(newchatMediaDir, { recursive: true });
  }

  // Create data folder -- can just put the DB file in root folder
  /* if (!fs.existsSync(path.join(index.appDataDir, `DB`))) {
    fs.mkdirSync(path.join(index.appDataDir, `DB`), { recursive: true });
  } */

  return newchatMediaDir;
}

export async function sortChats() {
  switch (index.chatPlatform) {
    case K.ChatPlatform.Instagram:
    case K.ChatPlatform.Messenger:
      // sort chats by the directory size to gauge the importance of contacts
      const chatSizeMap = new Map();
      const chatDirNames = fs.readdirSync(index.inboxDir).filter(isNotJunk);
      // console.log('chatDirNames:', chatDirNames);

      for (const chatDirName of chatDirNames) {
        chatSizeMap.set(
          chatDirName,
          await getFolderSize.loose(path.join(index.inboxDir, chatDirName))
        );
      }
      // console.log('chatSizeMap:', chatSizeMap);

      const sortedChatDirNames = new Map(
        [...chatSizeMap.entries()].sort((a, b) => b[1] - a[1])
      );
      // console.log('sortedChatDirNames:', sortedChatDirNames);

      const chatMap = new Map();

      for (let chatName of sortedChatDirNames.keys()) {
        let chatObj = new index.chatObject(
          chatName,
          sortedChatDirNames.get(chatName)
        );

        chatMap.set(chatName, chatObj);
      }

      // Parse chats with all contacts for now; only parse selected chats later based on user selection
      return chatMap;
  }
}

export async function createChatMediaFolders() {
  switch (index.chatPlatform) {
    case K.ChatPlatform.Instagram:
    case K.ChatPlatform.Messenger:
      // let chatMediaPathMap = new Map();

      for (let chatName of index.chatMap.keys()) {
        // Create media folders for each chat
        const chatMediaPath = path.join(index.mediaDir, chatName);
        fs.mkdirSync(path.join(chatMediaPath, 'photos'), { recursive: true });
        fs.mkdirSync(path.join(chatMediaPath, 'audio'), { recursive: true });
        fs.mkdirSync(path.join(chatMediaPath, 'videos'), { recursive: true });

        // chatMediaPathMap.set(chatName, chatMediaPath);
        index.chatMap.get(chatName).mediaPath = chatMediaPath;
      }
  }
}

export async function getChatFiles() {
  switch (index.chatPlatform) {
    case K.ChatPlatform.Instagram:
    case K.ChatPlatform.Messenger:
      for (let chatName of index.chatMap.keys()) {
        // grab the chat json files based on chat name
        let jsonFileNames = fs
          .readdirSync(path.join(index.inboxDir, chatName))
          .filter((file) => {
            return path.extname(file) == '.json';
          });
        // console.log('jsonFilePath:', path.join(index.inboxDir, chatName));
        // console.log('jsonFileNames:', jsonFileNames);

        // get the full chat JSON file paths that can be used for import
        for (let chatFile of jsonFileNames) {
          let filePath = path.join(index.inboxDir, chatName, chatFile);
          // console.log('filePath:', filePath);

          index.chatMap.get(chatName).chatFilePaths.push(filePath);
        }
      }
      break;
  }
}
