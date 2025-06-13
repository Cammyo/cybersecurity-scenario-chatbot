const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('api', {
  fetchScenarios: () => ipcRenderer.invoke('fetch-scenarios'),
  addScenario: (scenario) => ipcRenderer.invoke('add-scenario', scenario),
  deleteScenario: (id) => ipcRenderer.invoke('delete-scenario', id),
  sendToChatbot: (query) => ipcRenderer.invoke('send-to-chatbot', query),
});
