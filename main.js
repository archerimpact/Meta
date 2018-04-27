const electron = require('electron')
// Module to control application life.
const app = electron.app
// Module to create native browser window.
const BrowserWindow = electron.BrowserWindow

const path = require('path')
const url = require('url')

// Instance of storage class. Will be used to ensure that files persist across
// application instances.
const Storage = require('./js/storage.js');
const storage = new Storage({
  defaults: {}
});

// Import database file.
const Database = require('./js/database.js');
const db = new Database({
  defaults: {}
});
// const db = init_database();

// Keep a global reference of the window object, if you don't, the window will
// be closed automatically when the JavaScript object is garbage collected.
let mainWindow

// Set storage instance to be used across js files. All constants that should
// be accessible to other scripts must go here.
global.sharedObj = {db: db};

// for testing
db.db.serialize(function() {
  db.create_project('testproj_name', 'testdesc');
  db.add_image('testname2', 'testpath/testname2', 'testproj_name');
  db.add_image('testname2', 'testpath/testname2', 'testproj_name');
  console.log('call db.get_all_images: ', db.get_all_images_by_project('testproj_name', function(images) {
    console.log('images: ', images);
    return images;
  }));
  console.log('call db.get_projects: ', db.get_projects(function(projects) {
    console.log('projects: ', projects);
    return projects;
  }));
});

function createWindow () {
  // Create the browser window.
  mainWindow = new BrowserWindow({width: 1000, height: 800})
  // mainWindow.setFullScreen(true)

  // and load the index.html of the app.
  mainWindow.loadURL(url.format({
    pathname: path.join(__dirname, 'index.html'),
    protocol: 'file:',
    slashes: true
  }))

  // Open the DevTools.
  mainWindow.webContents.openDevTools()

  // Emitted when the window is closed.
  mainWindow.on('closed', function () {
    // Dereference the window object, usually you would store windows
    // in an array if your app supports multi windows, this is the time
    // when you should delete the corresponding element.
    mainWindow = null
  })
}

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
if (app) {
  app.on('ready', createWindow)

  // Quit when all windows are closed.
  app.on('window-all-closed', function () {
    db.close();

    // On OS X it is common for applications and their menu bar
    // to stay active until the user quits explicitly with Cmd + Q
    if (process.platform !== 'darwin') {
      app.quit()
    }
  })

  app.on('activate', function () {
    // On OS X it's common to re-create a window in the app when the
    // dock icon is clicked and there are no other windows open.
    if (mainWindow === null) {
      createWindow()
    }
  })
}

// In this file you can include the rest of your app's specific main process
// code. You can also put them in separate files and require them here.
