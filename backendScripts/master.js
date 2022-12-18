'use strict';

import * as jsonImporter from './service/jsonImporter.js';
import * as fileProcessor from './service/fileProcessor.js';
import * as dbService from './service/db.js';
import * as K from './util/constants.js';

/* user - CHANGE THESE MANUALLY FOR NOW! */
// TODO: Move under system APPDATA directory later
export let chatPlatform = K.ChatPlatform.Unknown;
export const appDataDir = `../userEnv/appData`; // there is a wiki for setting this with electron
export const userImportedFilePath = `../userEnv/files/arainyspringday_20221216.zip`;

/* Import Session */
export let importDataPath = null;
export let inboxDir = null;
export let mediaDir = null;
export let db;
export let chatMap = new Map();

export function chatObject(name, size) {
  this.name = name;
  this.size = size;
  this.mediaPath = null;
  this.chatFilePaths = [];
}

importDataPath = fileProcessor.unZip();
console.log('importDataPath:', importDataPath);

/* Detect chat platfrom */
try {
  chatPlatform = fileProcessor.detectPlatform(importDataPath);
} catch (error) {
  console.error(error);
}

/* Confirm that there is a messages/inbox to work with */
try {
  inboxDir = fileProcessor.validateChatFolder();
  console.log('inboxDir:', inboxDir);
} catch (error) {
  console.log(error);
}

/* Create Media folder */
mediaDir = fileProcessor.createStorageLocations(appDataDir);
console.log('chatMediaDir:', mediaDir);

/* Open Database */
db = dbService.connectRememberedDB();

/* Create data tables */
dbService.initializeDatabaseTables();

/* Sort chats by size */
chatMap = await fileProcessor.sortChats();
// console.log('chatMap:', chatMap);

/* Create subfolders under Media folder for each chat for audio, video and photo */
await fileProcessor.createChatMediaFolders();
// console.log('chatMap:', chatMap);

/* Get the file paths of all the message files */
await fileProcessor.getChatFiles();
// console.log('chatMap:', chatMap);

/* Start import process for each chat */
for (let chatName of chatMap.keys()) {
  console.log(`\n --- importing ${chatName} ---`);
  let customTitle = chatName.split('_')[0];
  let messengerChatID = '';
  let instagramChatID = '';

  if (chatPlatform == K.ChatPlatform.Messenger) {
    messengerChatID = chatName;
  } else if (chatPlatform == K.ChatPlatform.Instagram) {
    instagramChatID = chatName;
  }
  await jsonImporter.importSingleChat(
    customTitle,
    messengerChatID,
    instagramChatID,
    chatMap.get(chatName).mediaPath,
    chatMap.get(chatName).chatFilePaths
  );
  console.log(
    `Finished importing ${chatName}. Saved all multi-media files to disk`
  );
}

console.log('$$$$$ Closing DB $$$$$$');
dbService.closeRememberedDB();
