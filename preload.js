'use strict';

const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('api', {
  send: (channel, ...args) => {
    const validChannels = ['start-login', 'stop-login', 'start-autoplay', 'stop-autoplay', 'save-settings'];
    if (validChannels.includes(channel)) {
      ipcRenderer.send(channel, ...args);
    }
  },
  invoke: (channel, ...args) => {
    const validChannels = ['load-settings'];
    if (validChannels.includes(channel)) {
      return ipcRenderer.invoke(channel, ...args);
    }
  },
  on: (channel, callback) => {
    const validChannels = ['log-message', 'status-update'];
    if (validChannels.includes(channel)) {
      ipcRenderer.on(channel, (event, ...args) => callback(...args));
    }
  },
});
