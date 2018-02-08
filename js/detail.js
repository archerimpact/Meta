const electron = require('electron');
const path = require('path');
const fs = require('fs');
const remote = require('electron').remote;
const Image = require('./image.js');
const getProjectJsonPath = require('./project.js').getProjectJsonPath
const loadProject = require('./project.js').loadProject
const Mustache = require('Mustache');

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

  //document.getElementById('name-header').innerHTML = document.getElementById('name-header').innerHTML.replace("name-pc", projectName).replace("description-pc", "description here");
  createHeader(projectName, "some description");

}

function createHeader(projName, projDesc) {
  template = [
    "<h1 id='name-header' class='my-4'>{{projName}}",
      "<small>{{projDesc}}</small>",
    "</h1>",
  ].join("\n");
  data = {
    projName: projName,
    projDesc: projDesc,
  }
  var filler = Mustache.render(template, data);
  $("#detail-header").append(filler);
}

module.exports = {
	loadDetail: loadDetail,
	Detail: Detail
};
