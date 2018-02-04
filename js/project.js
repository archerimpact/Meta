const electron = require('electron');
const path = require('path');
const fs = require('fs');
const storage = require('./storage.js');
const image = require('./image.js');

class Project {

  constructor(store) {
    // Retain storage instance
    this._store = store;

    // List of all images/videos associated with this project
    this._images = new Object();

    // Set default project name
    this._projectName = 'New Project ' + storage.getNumberProjects();

    // Project description variable
    this._description = '';

    // Project timestamp
    this._timestamp = Date.now();
  }

  // Add an image/video to the project
  addImage(name, path) {
    var image = new Image(name, path, this);
    this._image[name] = image;
  }

  // Remove an image/video from the project
  removeImage(name) {
    delete this._image[name];
  }

  // Update the project name
  updateProjectName(name) {
    this._projectName = name;
  }

  // Update the project description
  updateDescription(description) {
    this._description = description;
  }

  // TODO(varsha): Export the project to CSV
  exportToCsv() {

  }

  // TODO(varsha): Eventually update the saving process, so that it is more efficient.
  saveProject() {
    const userDataPath = (electron.app || electron.remote.app).getPath('userData');

    // Create directory for this project
    var projectDirectory = path.join(userDataPath, this._projectName + '.json');
    fs.makedir(projectDirectory);

    // Store all relevant images in the project directory
    var image;
    for (image in Object.keys(this._images)) {
      var imagePath = this._images[image];
      fs.writeFileSync(imagePath, JSON.stringify(image.toDict()));
    }

    // Call storage class
    this._store.saveProject(this._projectName, projectDirectory);
  }

  // Converts this class information to a dictionary
  toDict() {
    var projectDict = new Object();
    projectDict['images'] = this._images;
    projectDict['projectName'] = this._projectName;
    projectDict['description'] = this._description;
    projectDict['timestamp'] = this._timestamp;
  }

}

function loadProject(jsonFile) {
  var rawData = fs.readFileSync(jsonFile);
  var info = JSON.parse(rawData);

  var project = new Project();

  // Load name.
  project.updateProjectName(info['projectName']);

  // Load description.
  project.updateDescription(info['description']);

  // Load images.
  project._images = info['images'];

  // TODO(varsha): do rendering here
}

module.exports = Project
