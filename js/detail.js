const electron = require('electron')
const path = require('path')
const fs = require('fs')
const remote = require('electron').remote
const Image = require('./image.js')
const getProjectJsonPath = require('./project.js').getProjectJsonPath
const loadProject = require('./project.js').loadProject
const Mustache = require('Mustache')

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
	// for (var i = 0; i < len(images); i++){
	for (var i = 0; i < 2; i++){
		var data = {
		    name: "Image #" + i,
		    path: "image._path",
		    phone: "image._phone",
			exifData: null
		}

		// var image = images[i];
		// var data = image.getMetadata();
		// data[name] = image.getName();
		// data[path] = image.getPath();
		col1 = '';
		col2 = '';
		count = 0;
		for (var key in data) {
			if (count == 0) {
				col1 += key + ': ' + data[key] + '<br>';
				count = 1;
			} else {
				col2 += key + ': ' + data[key] + '<br>';
				count = 0;
			}
			
		}

		var template = [
		    '<div id="detail-template" class="row">',
		      '<div class="col-md-7">',
		        '<a href="#">',
		          '<img class="img-fluid rounded mb-3 mb-md-0" src="http://placehold.it/700x300" alt="">',
		        '</a>',
		      '</div>',
		      '<div class="col-md-5">',
		        '<h3>{{name}}</h3>',
		        '<p>',
		        '<div class="row">',
		          '<div class="col-md-5">',
		          	col1,
		          '</div>',
		          '<div class="col-md-7">',
		          	col2,
		          '</div>',
		        '</div>',
		        '<a class="btn btn-primary" href="#">View More</a>',
		      '</div>',
		    '</div>',
		    '<hr>'
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
	document.getElementById("detail-header").innerHTML = ""
	document.getElementById("image-wrapper").innerHTML = ""
}

module.exports = {
	loadDetail: loadDetail
};
