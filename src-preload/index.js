const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('fileAPI', {
  processFile: () => ipcRenderer.invoke('processFile'),
  chooseFile: () => ipcRenderer.invoke('dialog:chooseFile'),
  importSelectedChats: () => ipcRenderer.invoke('importSelectedChats'),
});

contextBridge.exposeInMainWorld('databaseAPI', {
  getContacts: () => ipcRenderer.invoke('getContacts'),
});
