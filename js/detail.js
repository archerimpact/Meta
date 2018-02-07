const electron = require('electron');
const path = require('path');
const fs = require('fs');
const remote = require('electron').remote;
const Image = require('./image.js');

class Detail {

  constructor(project) {
    // Store project
    this._project =  project;

    // Store images associated with the project
    this._images = project.loadImages();
  }

  // Create 
  uploadImage(path) {

  }

}

module.exports = Detail
