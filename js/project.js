const electron = require('electron');
const path = require('path');
const fs = require('fs');
const remote = require('electron').remote;
const Images = require('./image.js');
const Image = Images.Image;
// var csvWriter = require('csv-write-stream');
// const writer = csvWriter();

class Project {

  constructor(name, description) {
    // List of all images/videos associated with this project
    this._images = new Object();

    // Set project name
    this._projectName = name;

    // Set project description
    this._description = description;

    // Project timestamp
    this._creation = Date.now();

    // Store last modified timestamp
    this._lastModified = Date.now();

    // Set project directory pathname
    const userDataPath = (electron.app || electron.remote.app).getPath('userData');

    var projectPath = path.join(userDataPath, "Projects");
    if (!fs.existsSync(projectPath)) {
      fs.mkdir(projectPath);
    }
    this._projectDirectory = path.join(projectPath, this._projectName);
  }

  getImages() {
    return this._images;
  }

  getName() {
    return this._projectName;
  }
  getDescription() {
    return this._description;
  }

  // Add an image/video to the project
  addImage(name, path) {
    var image = new Image(name, path, this);

    this._images[name] = image.getInfo();

    //this._images[name] = image.toDict();
    this.addImageAppData(image);

    console.log('added image: ' + image);
    console.log(this._images);


    this._lastModified = Date.now();
  }

  // Add a copy of the image to project/image/ folder inside the AppData
  addImageAppData(image) {
    return
  }

  // Remove an image/video from the project
  removeImage(name) {
    delete this._images[name];

    this._lastModified = Date.now();
  }

  // Update the project name
  updateProjectName(name) {
    this._projectName = name;

    this._lastModified = Date.now();
  }

  // Update the project description
  updateDescription(description) {
    this._description = description;

    this._lastModified = Date.now();
  }

  // Set images dictionary (to be used only for reloading)
  setImages(imageDict) {
    this._images = imageDict;
  }

  // Set creation timestamp (to be used only for reloading)
  setCreation(timestamp) {
    this._creation = timestamp;
  }

  // Update lastModified timestamp
  setLastModified(timestamp) {
    this._lastModified = timestamp;
  }

  // TODO(varsha): Export the project to CSV
  exportToCsv() {
    writer.pipe(fs.createWriteStream(path.join(this.getProjectDirectory(), this.getProjectName() + ".csv")));
    writer.write(this.toDict());
    writer.end();
  }

  // TODO(varsha): Eventually update the saving process, so that it is more efficient.
  saveProject() {

    // Create directory for this project
    fs.mkdir(this._projectDirectory);
    var projectFilePath = path.join(this._projectDirectory, this._projectName + '.json');

    // Save all images.
    var imageDirectory = path.join(this._projectDirectory, 'images');
    var imageDict = new Object();

    for (var image in this._images) {
      if (!fs.existsSync(imageDirectory)) {
        fs.mkdir(imageDirectory);
      }
      var imageFilePath = path.join(imageDirectory, image + '.json');
      console.log("image file path");
      console.log(imageFilePath);
      if (!fs.existsSync(imageFilePath)) {
        var dict_obj = this._images[image];
        console.log(dict_obj);
        fs.writeFileSync(imageFilePath, JSON.stringify(dict_obj));
      }
      // console.log(this._images[image]);
      imageDict[image] = this._images[image]['name'];
    }
// =======
//     for (var key in this._images) {
//       console.log(key);
//     }
//     // for (var image in this._images) {
//     //   console.log('in for loopp');
//     //   console.log(image);
//     //   if (!fs.existsSync(imageDirectory)) {
//     //     fs.mkdir(imageDirectory);
//     //   }
//     //   var imageFilePath = path.join(imageDirectory, image + '.json');
//     //   if (!fs.existsSync(imageFilePath)) {
//     //     var dict_obj = this._images[image];
//     //     console.log(dict_obj);
//     //     fs.writeFileSync(imageFilePath, JSON.stringify(dict_obj));
//     //   }
//     //   // console.log(this._images[image]);
//     //   imageDict[image] = this._images[image]['name'];
//     // }
// >>>>>>> master

    fs.writeFileSync(projectFilePath, JSON.stringify(this.toDict()));

    // Call storage class
    var storage = remote.getGlobal('sharedObj').store;
    storage.saveProject(this._projectName, this._projectDirectory);
  }

  // Converts this class information to a dictionary
  toDict() {
    //when we call this function is when we get the circular part
    //it's because of the images attribute
    var projectDict = new Object();
    projectDict['images'] = this._images;
    projectDict['projectName'] = this._projectName;
    projectDict['description'] = this._description;
    projectDict['creation'] = this._creation;
    projectDict['lastModified'] = this._lastModified;
    return projectDict;
  }

  // Constructs instance of Image class for all images linked to this project,
  // using an input JSON file. To be used upon reloading a project.
  loadImages() {
    var imagePath, image, rawData, info;
    var images = [];

    for (imagePath in this._images) {
      console.log("imagePath");
      console.log(imagePath);
      console.log(this._images[imagePath]);

      //rawData = fs.readFileSync(imagePath);
      //info = JSON.parse(rawData);

      // Create image instance.
      // image = new Image(info['name'], info['path'], info['project']);
      // image.setMetadata(info['metadata']);
      image = this._images[imagePath];

      // Add image instance to list of images associated with this project.
      images.push(image);
    }

    return images;
  }

  // Return project directory path.
  getProjectDirectory() {
    return this._projectDirectory;
  }

  // Return project name.
  getProjectName() {
    return this._projectName;
  }

}

// Constructs instance of Project class from JSON file.
function loadProject(jsonFile) {
  try {
    var rawData = fs.readFileSync(jsonFile);
  } catch (error) {
    console.log(error);
    return null;
  }
  var info = JSON.parse(rawData);

  var project = new Project(info['projectName'], info['description']);

  // Load images.
  project.setImages(info['images']);

  // Set creation timestamp.
  project.setCreation(info['creation']);

  // Set lastModified timestamp.
  project.setLastModified(info['lastModified']);

  return project;
}

function getProjectJsonPath(projectName) {
  const userDataPath = (electron.app || electron.remote.app).getPath('userData');
  var projectPath = path.join(userDataPath, "Projects");
  var projectDirectory = path.join(projectPath, projectName.toString());
  return path.join(projectDirectory, projectName + '.json');
}

module.exports = {
  Project: Project,
  loadProject: loadProject,
  getProjectJsonPath: getProjectJsonPath
}
