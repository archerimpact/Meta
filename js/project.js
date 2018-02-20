const electron = require('electron');
const path = require('path');
const fs = require('fs');
const remote = require('electron').remote;
const Images = require('./image.js');
const Image = Images.Image;

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
    console.log(projectPath);
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
    this._images[name] = image.toDict();

    console.log('added image: ' + image);
    console.log(this._images);

    this._lastModified = Date.now();
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

  }

  // TODO(varsha): Eventually update the saving process, so that it is more efficient.
  saveProject() {

    // Create directory for this project
    fs.mkdir(this._projectDirectory);
    var projectFilePath = path.join(this._projectDirectory, this._projectName + '.json');

    // Save all images.
    var imageDirectory = path.join(this._projectDirectory, 'images');
    var imageDict = new Object();
    console.log('saving project: ');
    console.log(this._images);
    for (var key in this._images) {
      console.log(key);
    }
    // for (var image in this._images) {
    //   console.log('in for loopp');
    //   console.log(image);
    //   if (!fs.existsSync(imageDirectory)) {
    //     fs.mkdir(imageDirectory);
    //   }
    //   var imageFilePath = path.join(imageDirectory, image + '.json');
    //   if (!fs.existsSync(imageFilePath)) {
    //     var dict_obj = this._images[image];
    //     console.log(dict_obj);
    //     fs.writeFileSync(imageFilePath, JSON.stringify(dict_obj));
    //   }
    //   // console.log(this._images[image]);
    //   imageDict[image] = this._images[image]['name'];
    // }

    fs.writeFileSync(projectFilePath, JSON.stringify(this.toDict()));

    // Call storage class
    var storage = remote.getGlobal('sharedObj').store;
    storage.saveProject(this._projectName, this._projectDirectory);
  }

  // Converts this class information to a dictionary
  toDict() {
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

    for (imagePath in Object.values(this._images)) {
      rawData = fs.readFileSync(imagePath);
      info = JSON.parse(rawData);

      // Create image instance.
      image = new Image(info['name'], info['path'], info['project']);
      image.setMetadata(info['metadata']);

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
  var rawData = fs.readFileSync(jsonFile);
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
  var projectDirectory = path.join(projectPath, projectName);
  return path.join(projectDirectory, projectName + '.json');
}

module.exports = {
  Project: Project,
  loadProject: loadProject,
  getProjectJsonPath: getProjectJsonPath
}
