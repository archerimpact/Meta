const electron = require('electron');
const path = require('path');
const fs = require('fs');
const remote = require('electron').remote;
const Image = require('./image.js');
const getProjectJsonPath = require('./project.js').getProjectJsonPath
const loadProject = require('./project.js').loadProject

class Detail {

  constructor(project) {
    // Store project
    this._project = project;

    // Store images associated with the project
    this._images = project.loadImages();
  }

  // Create 
  uploadImage(path) {

  }
}

function loadDetail(projectName){
	var projectPath = getProjectJsonPath(projectName);
	var project = loadProject(projectPath);
	var detail = new Detail(project);
	// iterate through images and add to html
	redirect('detail');
}

module.exports = {
	loadDetail: loadDetail,
	Detail: Detail
};
