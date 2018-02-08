const electron = require('electron')
const path = require('path')
const fs = require('fs')
const remote = require('electron').remote
const Image = require('./image.js')
const getProjectJsonPath = require('./project.js').getProjectJsonPath
const loadProject = require('./project.js').loadProject
const Mustache = require('Mustache')


class Detail {

  constructor(project) {
    // Store project
    this._project = project;

    // Store images associated with the project
    this._images = project.loadImages();

    this.addToHtml();
  }

  addToHtml() {
	var projectName = this._project._projectName;
	var projectDesc = this._project._description;
	

	var html = [
	    '<div class="proj-header">',
	        '<h1 class="name-header">' + projectName + '<h1>',
	        '<h2 class="description-header">' + projectDesc + '<h2>',
	    '</div>'
	].join("\n");

	$("header").append(html);
  }
  // Create 
  uploadImage(path) {

  }
}

function loadDetail(projectName){
	clearDetailsHtml();
	var projectPath = getProjectJsonPath(projectName);
	var project = loadProject(projectPath);
	// Should we drop the Detail class??
	// var detail = new Detail(project);

	redirect('detail');
  	//document.getElementById('name-header').innerHTML = document.getElementById('name-header').innerHTML.replace("name-pc", projectName).replace("description-pc", "description here");
  	loadHeader(project);
  	loadImages(project);
}

function loadImages(project){
	// Add each image in project into details.html
	var images = project.loadImages();
	for (var i = 0; i < images.length; i++){
		var image = images[i];
		var data = {
		    name: image._name,
		    path: image._path,
			exifData: null
		}

		var template = [
		    '<div class="image-header">',
		        '<h1 class="image-name">{{name}}<h1>',
		        '<p>{{path}}</p>',
		    '</div>'
		].join("\n");
		// template: '<div ...>\n<h1 ...>{{title}}<h1>\n</div>'

		var filler = Mustache.render(template, data);
		$("#image-wrapper").append(filler);
	}

}

function loadHeader(project) {
  template = [
    "<h1 id='name-header' class='my-4'>{{projName}}",
      "<small>{{projDesc}}</small>",
    "</h1>",
  ].join("\n");
  data = {
    projName: project._projectName,
    projDesc: project._description,
  }
  var filler = Mustache.render(template, data);
  $("#detail-header").append(filler);
}

function clearDetailsHtml(){
	// clear previous projects on the html
}

module.exports = {
	loadDetail: loadDetail,
	Detail: Detail
};
