// Modules to control application life and create native browser window
import { app, BrowserWindow, ipcMain } from 'electron';
import { path } from 'path';
import { unZip, detectPlatform, validateChatFolder, sortChats } from '../backendScripts/service/fileProcessor';
import { ChatPlatform } from '../backendScripts/util/constants';
import { isDev } from 'electron-is-dev';

const appDataDir = `/Users/alicewang913/Documents/Remembered`; // there is a wiki for setting this with electron
const userImportedFilePath = `/Users/alicewang913/Documents/Memory/alice_wwwww913_ins_JSON`;
let chatPlatform = ChatPlatform.Unknown;

async function handleProcessFile () {
  // const { canceled, filePaths } = await dialog.showOpenDialog();
  // if (canceled) {
  //   return
  // } else {
  //   console.log(`Currently handling processing ${filePaths[0]}`);
  //   return filePaths[0];
  // }
  const chatFilePath = unZip(userImportedFilePath, appDataDir);
  console.log('Chat File Path:', chatFilePath);
  let inboxDir = '';

  try {
    chatPlatform = detectPlatform(chatFilePath);
  } catch (error) {
    console.error(error);
  }

  try {
    inboxDir = validateChatFolder(chatFilePath, chatPlatform);
    console.log('Inbox Directory Path:', inboxDir);
  } catch (error) {
    console.error(error);
  }

  const chatMap = await sortChats(inboxDir, chatPlatform);
  console.log('chatMap:', chatMap);
  return [ ...chatMap.keys() ];
}

function createWindow() {
  // Create the browser window.
  const mainWindow = new BrowserWindow({
    width: 1200,
    height: 780,
    // frame: false,
    // resizable: false,
    // transparent: false,
    // webPreferences: {
    //   preload: path.join(__dirname, 'preload.js'),
    // },
  });

  // and load the index.html of the app.
  mainWindow.loadURL(`file://${path.join(__dirname, 'index.html')}`);
  // mainWindow.loadURL('http://localhost:3000');

  // Open the DevTools.
  mainWindow.webContents.openDevTools()
}

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.whenReady().then(() => {
  ipcMain.handle('processFile', handleProcessFile);
  createWindow();

  app.on('activate', function () {
    // On macOS it's common to re-create a window in the app when the
    // dock icon is clicked and there are no other windows open.
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

// Quit when all windows are closed, except on macOS. There, it's common
// for applications and their menu bar to stay active until the user quits
// explicitly with Cmd + Q.
app.on('window-all-closed', function () {
  if (process.platform !== 'darwin') app.quit();
});

// In this file you can include the rest of your app's specific main process
// code. You can also put them in separate files and require them here.
