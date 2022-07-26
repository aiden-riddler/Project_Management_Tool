// Modules to control application life and create native browser window
const {app, BrowserWindow, ipcMain} = require('electron')
const path = require('path')
const { PythonShell } = require("python-shell");

let mainWindow;

function createWindow () {
  // Create the browser window.
  mainWindow = new BrowserWindow({
    width: 1500,
    height: 1000,
    minWidth:1000,
    minHeight: 600,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      nodeIntegration: false,
      contextIsolation: true,
      enableRemoteModule: false
    }
  })

  // and load the index.html of the app.
  mainWindow.loadFile('index.html')
  mainWindow.loadUrl(`file://${__dirname}/add.html`);

  // Open the DevTools.
  // mainWindow.webContents.openDevTools()
}

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.whenReady().then(() => {
  createWindow()

  app.on('activate', function () {
    // On macOS it's common to re-create a window in the app when the
    // dock icon is clicked and there are no other windows open.
    if (BrowserWindow.getAllWindows().length === 0) createWindow()
  })
})

// Quit when all windows are closed, except on macOS. There, it's common
// for applications and their menu bar to stay active until the user quits
// explicitly with Cmd + Q.
app.on('window-all-closed', function () {
  if (process.platform !== 'darwin') app.quit()
})

// In this file you can include the rest of your app's specific main process
// code. You can also put them in separate files and require them here.

ipcMain.on("toMain", (event, data) => {
    var options = {
      scriptPath : path.join(__dirname, './engine/'),
      args : [JSON.stringify(data)]
    }

    PythonShell.run("main.py", options, function(err, results){
      if (err) throw err;
      mainWindow.webContents.send("fromMain", results);
    })
})

ipcMain.on("updateData", (event, data) => {
  var options = {
    scriptPath : path.join(__dirname, './engine/'),
    args : [JSON.stringify(data)]
  }

  PythonShell.run("main.py", options, function(err, results){
    if (err) throw err;
    mainWindow.webContents.send("updateResults", results);
  })
})

ipcMain.on("insertRecord", (event, data) => {
  var options = {
    scriptPath : path.join(__dirname, './engine/'),
    args : [JSON.stringify(data)]
  }

  PythonShell.run("insert.py", options, function(err, results){
    if (err) throw err;
    mainWindow.webContents.send("insertResponse", results);
  })
})

ipcMain.on("getDashboardData", (event, data) => {
  var options = {
    scriptPath : path.join(__dirname, './engine/'),
    args : [JSON.stringify(data)]
  }

  PythonShell.run("main.py", options, function(err, results){
    if (err) throw err;
    mainWindow.webContents.send("receiveDashboardData", results);
  })
})

ipcMain.on("deleteTask", (event, data) => {
  var options = {
    scriptPath : path.join(__dirname, './engine/'),
    args : [JSON.stringify(data)]
  }

  PythonShell.run("delete.py", options, function(err, results){
    if (err) throw err;
  })
})

ipcMain.on("getCourses", (event, data) => {
  var options = {
    scriptPath : path.join(__dirname, './engine/'),
    args : [JSON.stringify(data)]
  }

  PythonShell.run("get_courses.py", options, function(err, results){
    if (err) throw err;
    mainWindow.webContents.send("receiveCourses", results);
  })
})