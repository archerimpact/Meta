const electron = require('electron');
const path = require('path');
const fs = require('fs');
const project = require('./project.js');

class Storage {
  constructor(opts) {
    // Get the user data path, the directory in which the information will be stored.
    const userDataPath = (electron.app || electron.remote.app).getPath('userData');

    // Specify path name, for the saved projects file.
    this.path = path.join(userDataPath, 'saved-projects.json');

    // Store mapping from project name to project path
    this.projectPaths = new Object();

    // Load all prior saved projects.
    this.projects = populateProjects(this.path, opts.defaults);
  }

  // Return the value associated with a saved project (specified by string key).
  getProject(projectName) {
    return this.projects[projectName];
  }

  // Save a project.
  saveProject(projectName, projectDirectory) {
    this.projects[projectName] = projectDirectory;

    saveAll();
  }

  // Update an attribute of a project.
  updateProject(projectName, attribute, text, newValue = null) {
    var projectDirectory = this.projects[projectName];
    var projectJson = path.join(projectDirectory, this.projectName + '.json');
    var proj = project.loadProject(projectJson);

    switch(attribute) {
      case 'addImage':
        proj.addImage(text, newValue);
        break;
      case 'removeImage':
        proj.removeImage(text);
        break;
      case 'updateProjectName':
        proj.updateProjectName(text);
        break;
      case 'updateDescription':
        proj.updateDescription(text);
        break;
    }

    proj.saveProject();
  }

  // Return the number of projects that have been saved
  getNumberProjects() {
    return Object.keys(this.projects).length;
  }

  // Saves all projects and updates saved-projects list
  saveAll() {
    // We're not writing a server so there's not nearly the same IO demand on
    // the process. Also, if we used an async API and our app was quit before
    // the asynchronous write had a chance to complete, we might lose that data.
    // TODO(varsha): try/catch this.
    fs.writeFileSync(this.path, JSON.stringify(this.projects));
  }
}

function populateProjects(filePath, defaults) {
  // If the file already exists, return the existing data. Otherwise, return
  // the specified default information.
  try {
    return JSON.parse(fs.readFileSync(filePath));
  } catch (error) {
    console.log("\n\nERROR:\n" + error + "\n\n");
    return defaults;
  }
}

// expose the class
module.exports = Storage
