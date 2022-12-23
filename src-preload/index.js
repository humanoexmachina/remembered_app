const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('fileAPI', {
  processFile: () => ipcRenderer.invoke('processFile'),
  chooseFile: () => ipcRenderer.invoke('dialog:chooseFile'),
});