const electron = require('electron');
const path = require('path');
const fs = require('fs');
const remote = require('electron').remote;
const Image = require('./image.js');

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
    console.log(userDataPath);
    this._projectDirectory = path.join(userDataPath, this._projectName);
  }

  // Add an image/video to the project
  addImage(name, path) {
    var image = new Image(name, path, this);
    this._image[name] = image;

    setLastModified(Date.now());
  }

  // Remove an image/video from the project
  removeImage(name) {
    delete this._image[name];

    setLastModified(Date.now());
  }

  // Update the project name
  updateProjectName(name) {
    this._projectName = name;

    setLastModified(Date.now());
  }

  // Update the project description
  updateDescription(description) {
    this._description = description;

    setLastModified(Date.now());
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
    var filePath = path.join(projectDirectory, this._projectName + '.json');
    fs.writeFileSync(filePath, JSON.stringify(this.toDict()));

    // Store all relevant images in the project directory
    // var image;
    // for (image in Object.keys(this._images)) {
    //   var imagePath = this._images[image];
    //   fs.writeFileSync(imagePath, JSON.stringify(image.toDict()));
    // }

    // Call storage class
    var storage = remote.getGlobal('sharedObj').store;
    storage.saveProject(this._projectName, projectDirectory);
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

    for (imagePath in Object.values(project._images)) {
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

}

// Constructs instance of Project class from JSON file.
function loadProject(jsonFile) {
  var rawData = fs.readFileSync(jsonFile);
  var info = JSON.parse(rawData);

  var project = new Project(info['projectName'], info['description']);

  // Load images.
  project.setImageDict(info['images']);

  // Set creation timestamp.
  project.setCreation(info['creation']);

  // Set lastModified timestamp.
  project.setLastModified(info['lastModified']);

  return project;
}

function getProjectJsonPath(projectName) {
  const userDataPath = (electron.app || electron.remote.app).getPath('userData');
  var projectDirectory = path.join(userDataPath, this._projectName);
  return path.join(projectDirectory, projectName + '.json');
}

exports.Project = Project
