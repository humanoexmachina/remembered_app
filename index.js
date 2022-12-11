'use strict';

import * as fs from 'node:fs';
import * as path from 'node:path';
import AdmZip, * as admZip from 'adm-zip';
import getFolderSize from 'get-folder-size';
import {isNotJunk} from 'junk';

import {loadFile} from './service/jsonParser.mjs';
import {createNewDatabase, initializeDatabaseTables} from './service/db.js';

// TODO: Move under system APPDATA directory later
export const chatMemoryDir = `/Users/alicewang913/Documents/Remembered/ChatMemory`;
let chatHistoryPath = `/Users/alicewang913/Documents/Memory/alice_wwwww913_ins_JSON`;
// let chatHistoryPath = `/Users/alicewang913/Documents/Memory/alice_wwwww913_20221123.zip`;
// let chatHistoryPath = `/Users/alicewang913/Documents/Memory/facebook-jiannanwang54.zip`;
// let chatHistoryPath = `/Users/alicewang913/Documents/Memory/alice_wwwww913_ins_JSON_small_test`;

const ChatPlatform = {
  Unknown : "unknown",
  Messenger : "messenger",
  Instagram : "instagram"
}

const JSON = `.json`;

let chatPlatform = ChatPlatform.Unknown;

// check if the chat history is a zip file or folder
const chatHistoryStats = fs.statSync(chatHistoryPath);

if (chatHistoryStats.isFile() && (path.extname(chatHistoryPath) == `.zip`)) {
  // users uploaded a zip file
  console.log(`Users uploaded a zip file`);

  // create directory
  const decompressPath = path.join(chatMemoryDir, Date.now().toString());
  fs.mkdirSync(decompressPath, {recursive: true});
  console.log(`created ${decompressPath}`);
  // unzip the file
  const chatZip = new AdmZip(chatHistoryPath);
  chatZip.extractAllTo(decompressPath);

  // update the path to the new decompressed folder
  chatHistoryPath = decompressPath;
} else if (chatHistoryStats.isDirectory()) {
  // users uploaded a chat history directory
  console.log(`Users uploaded a chat history directory`);
} else {
  throw new Error(`Please upload the original chat history file downloaded from chat apps`);
}

// Determine the source of the chat history
if (fs.existsSync(path.join(chatHistoryPath, `past_instagram_insights`))) {
  // chat history is from Instagram
  console.log("Chat history is from Instagram");
  chatPlatform = ChatPlatform.Instagram;
} else if (fs.existsSync(path.join(chatHistoryPath, `messages`))) {
  // chat history is from Messenger
  console.log("Chat history is from Messenger");
  chatPlatform = ChatPlatform.Messenger;
} else {
  throw new Error("Seems like there is no chat history to be read");
}

/* Open Database */
if (!fs.existsSync(path.join(chatMemoryDir, `Data`))) {
  fs.mkdirSync(path.join(chatMemoryDir, `Data`), {recursive: true});
}
export var db = createNewDatabase();

/* Create data tables */
initializeDatabaseTables();

switch (chatPlatform) {
  case ChatPlatform.Instagram:
  case ChatPlatform.Messenger:
    const inboxDir = path.join(chatHistoryPath, `messages/inbox`);
    if (fs.existsSync(inboxDir)) {
      // sort chats by the size to gauga the importance of contacts
      const contactsWithSize = new Map();
      const contacts = await fs.readdirSync(inboxDir).filter(isNotJunk);
      for (const contact of contacts) {
        contactsWithSize.set(contact, await getFolderSize.loose(path.join(inboxDir, contact)));
      }
      const sortedContacts = new Map([...contactsWithSize.entries()].sort((a, b) => b[1] - a[1]));
      console.log(sortedContacts);

      // Parse chats with all contacts for now; only parse selected chats later based on user selection
      const selectedContacts = sortedContacts;
      
      for (let chatContact of selectedContacts.keys()) {
        // parse each json in the chat folder
        let chatFiles = fs.readdirSync(path.join(inboxDir, chatContact)).filter(file => {
          return path.extname(file) == JSON;
        });
        
        for (let chatFile of chatFiles) {
          let chatFilePath = path.join(inboxDir, chatContact, chatFile);
          await loadFile(chatFilePath, chatPlatform, chatContact);
          console.log(`Finish parsing ${chatFilePath}`);
          console.log(`Saving all multi-media files to disk`);
        }
      }
    } else {
      console.error(`No chats to read`);
    }
  break;
  case ChatSource.Unknown:
    console.log(`Chat source unknown. Nothing to parse`);
  break;
}