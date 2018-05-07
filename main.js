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
 db.add_project("TestProj", "Description", [], function(success, name, img_paths) {
   db.add_image("Image", "Path/Image", "TestProj", 1, 1, function(success, proj_name, img_path, index, num_images) {
     var data = {"testdata" : 1, "yuhlkamsdl" : 2, "yah" : "data"};
     db.add_image_meta("Path/Image", "TestProj", data, function(img_path, proj_name, meta_dict, success) {
      console.log("success?:", success);
     });
     db.update_favorite_image("Path/Image", "TestProj", false, function(img_path, proj_name, fave_bool, success) {
      db.get_image_metadata("Path/Image", "Image", "TestProj", function(bool, img_name, img_path, proj_name, meta_dict) {

      });
      db.get_favorite_images_in_project("TestProj", function(proj_name, images) {
        console.log("fav images:", images);
      });
      db.update_project_name("TestProj", "NewTestProj", function(old_name, new_name, success) {
        db.get_projects(function() {})
      });
     });
   });
 });
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
