const { contextBridge, ipcRenderer } = require('electron');
contextBridge.exposeInMainWorld('jarvis', {
  getSettings: () => ipcRenderer.invoke('settings:get'),
  saveSettings: p => ipcRenderer.invoke('settings:save', p),
  chat: m => ipcRenderer.invoke('ai:chat', m),
  pickApp: () => ipcRenderer.invoke('apps:pick'),
  listApps: () => ipcRenderer.invoke('apps:list'),
  removeApp: id => ipcRenderer.invoke('apps:remove', id),
  launchApp: id => ipcRenderer.invoke('apps:launch', id),
  createShortcut: () => ipcRenderer.invoke('shortcut:create'),
  systemInfo: () => ipcRenderer.invoke('system:info'),
  openExternal: url => ipcRenderer.invoke('external:open', url),
  onAppError: cb => ipcRenderer.on('app:error', (_e, msg) => cb(msg))
});
