import { contextBridge, ipcRenderer } from 'electron';

contextBridge.exposeInMainWorld('windowControls', {
  minimize: () => ipcRenderer.invoke('window:minimize'),
  close: () => ipcRenderer.invoke('window:close'),
  getAlwaysOnTop: () => ipcRenderer.invoke('window:get-always-on-top'),
  toggleAlwaysOnTop: () => ipcRenderer.invoke('window:toggle-always-on-top'),
  getSizePreset: () => ipcRenderer.invoke('window:get-size-preset'),
  setSizePreset: (preset) => ipcRenderer.invoke('window:set-size-preset', preset),
});
