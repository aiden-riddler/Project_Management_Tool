// All of the Node.js APIs are available in the preload process.
// It has the same sandbox as a Chrome extension.
window.addEventListener('DOMContentLoaded', () => {
    const replaceText = (selector, text) => {
      const element = document.getElementById(selector)
      if (element) element.innerText = text
    }
  
    for (const type of ['chrome', 'node', 'electron']) {
      replaceText(`${type}-version`, process.versions[type])
    }
  })
  
  const { contextBridge,ipcRenderer } = require("electron");
  contextBridge.exposeInMainWorld(
    "api", {
      send: (channel, data) => {
        let validChannels = ["toMain", "updateData", "insertRecord", "getDashboardData", "deleteTask", "getCourses"];
        if (validChannels.includes(channel)) {
          ipcRenderer.send(channel, data)
        }
      },
      receive: (channel, func) => {
        let validChannels = ["fromMain", "updateResults", "insertResponse", "receiveDashboardData", "receiveCourses"]
        if (validChannels.includes(channel)){
          ipcRenderer.on(channel, (event, ...args) => func(...args));
        }
      },
    }
  );

  
  