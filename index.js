'use strict';

import * as importer from './service/jsonImporter.mjs';
import * as fileProcessor from './service/fileProcessor.mjs';
import * as dbService from './service/db.js';
import * as K from './util/constants.js';

// TODO: Move under system APPDATA directory later
export let chatPlatform = K.ChatPlatform.Instagram;

/* user */
export const appDataDir = `appdata`;
export const userImportedFilePath = `files/arainyspringday_20221214.zip`;

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

// let chatOne = new chatObject('name', null, null, null);

// chatMap.set(chatOne.name, chatOne);
// console.log(chatOne);
// console.log(chatMap);

// chatMap.get(chatOne.name).size = 10;

// console.log(chatMap);
// console.log(chatOne);

// let chatHistoryPath = `/Users/alicewang913/Documents/Memory/alice_wwwww913_20221123.zip`;
// let chatHistoryPath = `/Users/alicewang913/Documents/Memory/facebook-jiannanwang54.zip`;
// let chatHistoryPath = `/Users/alicewang913/Documents/Memory/alice_wwwww913_ins_JSON_small_test`;

importDataPath = fileProcessor.unZip();
console.log('chatHistoryPath:', importDataPath);

try {
  inboxDir = fileProcessor.validateChatFolder();
  console.log('inboxDir:', inboxDir);
} catch (error) {
  console.log(error);
}

mediaDir = fileProcessor.createStorageLocations(appDataDir);
console.log('chatMediaDir:', mediaDir);

/* Open Database */
db = dbService.connectRememberedDB();

/* Create data tables */
dbService.initializeDatabaseTables();

chatMap = await fileProcessor.sortChats();
console.log('chatMap:', chatMap);

await fileProcessor.createChatMediaFolders();
console.log('chatMap:', chatMap);

await fileProcessor.getChatFiles();
console.log('chatMap:', chatMap);
