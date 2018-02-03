const electron = require('electron');
const path = require('path');
const fs = require('fs');
const storage = require('./storage.js');
const image = require('./image.js');

class Project {

  constructor(store) {
    // Retain storage instance
    this.store = store;

    // List of all images/videos associated with this project
    this.images = new Object();

    // Set default project name
    this.projectName = 'New Project ' + storage.getNumberProjects();

    // Project description variable
    this.description = '';

    // Project timestamp
    this.timestamp = Date.now();
  }

  // Add an image/video to the project
  addImage(name, data) {
    var image = new Image(data);
    this.image[name] = image;
  }

  // Remove an image/video from the project
  removeImage(name) {
    delete this.image[name];
  }

  // Update the project name
  updateProjectName(name) {
    this.projectName = name;
  }

  // Update the project description
  updateDescription(description) {
    this.description = description;
  }

  // TODO(varsha): Export the project to CSV
  exportToCsv() {

  }

  // TODO(varsha): Eventually update the saving process, so that it is more efficient.
  saveProject() {
    const userDataPath = (electron.app || electron.remote.app).getPath('userData');

    // Create directory for this project
    var projectDirectory = path.join(userDataPath, this.projectName + '.json');
    fs.makedir(projectDirectory);

    // Store all relevant images in the project directory
    var image;
    for (image in Object.keys(this.images)) {
      var imagePath = this.images[image];
      fs.writeFileSync(imagePath, JSON.stringify(image.toDict()));
    }

    // Call storage class
    this.store.saveProject(this.projectName, projectDirectory);
  }

  // Converts this class information to a dictionary
  toDict() {
    var projectDict = new Object();
    projectDict['images'] = this.images;
    projectDict['projectName'] = this.projectName;
    projectDict['description'] = this.description;
    projectDict['timestamp'] = this.timestamp;
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
  project.images = info['images'];

  // TODO(varsha): do rendering here
}
