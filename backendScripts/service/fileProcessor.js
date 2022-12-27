import * as K from '../util/constants.js';

import * as fs from 'node:fs';
import * as path from 'node:path';
import * as AdmZip from 'adm-zip';
import getFolderSize from 'get-folder-size';
import { isNotJunk } from 'junk';

export function chatObject(name, size) {
  this.name = name;
  this.size = size;
  this.mediaPath = null;
  this.chatFilePaths = [];
}

export function unZip(originalFilePath, appDataDir) {
  // check if the chat history is a zip file or folder
  const chatHistoryStats = fs.statSync(originalFilePath);

  if (chatHistoryStats.isFile() && path.extname(originalFilePath) === `.zip`) {
    // users uploaded a zip file
    console.log(`Detected a zip file`);

    // create directory
    const decompressPath = path.join(appDataDir, Date.now().toString());
    fs.mkdirSync(decompressPath, { recursive: true });
    console.log(`created ${decompressPath}`);
    // unzip the file
    const chatZip = new AdmZip(originalFilePath);
    chatZip.extractAllTo(decompressPath);

    // return the new path to the new decompressed folder
    return decompressPath;
  } else if (chatHistoryStats.isDirectory()) {
    // users uploaded a chat history directory
    console.log(`Users uploaded a chat history directory`);
    return originalFilePath;
  } else {
    throw new Error(
      `Please upload the original chat history file downloaded from chat apps`
    );
  }
}

export function detectPlatform(chatHistoryPath) {
  // Determine the source of the chat history
  if (fs.existsSync(path.join(chatHistoryPath, `past_instagram_insights`))) {
    // chat history is from Instagram
    console.log('Chat history is from Instagram');
    return K.ChatPlatform.Instagram;
  } else if (fs.existsSync(path.join(chatHistoryPath, `messages`))) {
    // chat history is from Messenger
    console.log('Chat history is from Messenger');
    return K.ChatPlatform.Messenger;
  } else {
    throw new Error('Unknown platform: cannot read chat history.');
  }
}

export function validateChatFolder(chatFilePath, chatPlatform) {
  switch (chatPlatform) {
    case K.ChatPlatform.Instagram:
    case K.ChatPlatform.Messenger:
      const inboxDir = path.join(chatFilePath, `messages/inbox`);

      if (fs.existsSync(inboxDir)) {
        return inboxDir;
      } else {
        throw new Error('##### ERROR: Chat folder was not found!');
      }
    default:
      console.log('chat platform undefined');
  }
}

// export function createStorageLocations() {
//   // Create media folder
//   let newchatMediaDir = path.join(index.appDataDir, `Media`);

//   if (!fs.existsSync(newchatMediaDir)) {
//     fs.mkdirSync(newchatMediaDir, { recursive: true });
//   }

//   return newchatMediaDir;
// }

export async function sortChats(inboxDir, chatPlatform) {
  switch (chatPlatform) {
    case K.ChatPlatform.Instagram:
    case K.ChatPlatform.Messenger:
      // sort chats by the directory size to gauge the importance of contacts
      const chatSizeMap = new Map();
      const chatDirNames = fs.readdirSync(inboxDir).filter(isNotJunk);
      // console.log('chatDirNames:', chatDirNames);

      for (const chatDirName of chatDirNames) {
        chatSizeMap.set(
          chatDirName,
          await getFolderSize.loose(path.join(inboxDir, chatDirName))
        );
      }
      // console.log('chatSizeMap:', chatSizeMap);

      const sortedChatDirNames = new Map(
        [...chatSizeMap.entries()].sort((a, b) => b[1] - a[1])
      );
      // console.log('sortedChatDirNames:', sortedChatDirNames);

      const chatMap = new Map();

      for (let chatName of sortedChatDirNames.keys()) {
        let chatObj = new chatObject(
          chatName,
          sortedChatDirNames.get(chatName)
        );

        chatMap.set(chatName, chatObj);
      }

      // Parse chats with all contacts for now; only parse selected chats later based on user selection
      return chatMap;
    default:
      console.log('chat platform undefined');
  }
}

// export async function createChatMediaFolders() {
//   switch (index.chatPlatform) {
//     case K.ChatPlatform.Instagram:
//     case K.ChatPlatform.Messenger:
//       // let chatMediaPathMap = new Map();

//       for (let chatName of index.chatMap.keys()) {
//         // Create media folders for each chat
//         const chatMediaPath = path.join(index.mediaDir, chatName);
//         fs.mkdirSync(path.join(chatMediaPath, 'photos'), { recursive: true });
//         fs.mkdirSync(path.join(chatMediaPath, 'audio'), { recursive: true });
//         fs.mkdirSync(path.join(chatMediaPath, 'videos'), { recursive: true });

//         // chatMediaPathMap.set(chatName, chatMediaPath);
//         index.chatMap.get(chatName).mediaPath = chatMediaPath;
//       }
//   }
// }

export async function getChatFiles(chatPlatform, chatMap, inboxDir) {
  switch (chatPlatform) {
    case K.ChatPlatform.Instagram:
    case K.ChatPlatform.Messenger:
      for (let chatName of chatMap.keys()) {
        // grab the chat json files based on chat name
        let jsonFileNames = fs
          .readdirSync(path.join(inboxDir, chatName))
          .filter((file) => {
            return path.extname(file) === '.json';
          });
        // console.log('jsonFilePath:', path.join(inboxDir, chatName));
        // console.log('jsonFileNames:', jsonFileNames);

        // get the full chat JSON file paths that can be used for import
        for (let chatFile of jsonFileNames) {
          let filePath = path.join(inboxDir, chatName, chatFile);
          // console.log('filePath:', filePath);

          chatMap.get(chatName).chatFilePaths.push(filePath);
        }
      }
      break;
    default: // do nothing
  }
}
