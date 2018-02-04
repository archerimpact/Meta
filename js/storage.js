const electron = require('electron');
const path = require('path');
const fs = require('fs');

class Storage {
  constructor(opts) {
    // Get the user data path, the directory in which the information will be stored.
    const userDataPath = (electron.app || electron.remote.app).getPath('userData');

    // Specify path name, for the saved projects file.
    this._path = path.join(userDataPath, 'saved-projects.json');

    // Load all prior saved projects.
    this._projects = populateProjects(this._path, opts.defaults);
  }

  // Return the value associated with a saved project (specified by string key).
  getProject(projectName) {
    return this._projects[projectName];
  }

  // Save a project.
  saveProject(projectName, data) {
    this._projects[projectName] = data;

    // We're not writing a server so there's not nearly the same IO demand on
    // the process. Also, if we used an async API and our app was quit before
    // the asynchronous write had a chance to complete, we might lose that data.
    // TODO(varsha): try/catch this.
    fs.writeFileSync(this._path, JSON.stringify(this._projects));
  }

  // Update an attribute of a project.
  updateProject(projectName, attribute, newValue) {
    var proj = this._projects[projectName];

    // Note that this assumes the project is formatted as a dictionary.
    proj[attribute] = newValue;

    // Save the update.
    fs.writeFileSync(this._path, JSON.stringify(this._projects));
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
