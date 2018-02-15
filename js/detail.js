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
		// var image = images[i];
		// var data = {
		//     name: image._name,
		//     path: image._path,
		// 	exifData: null
		// }

		var template = [
		    '<div id="detail-template" class="row">',
		      '<div class="col-md-7">',
		        '<a href="#">',
		          '<img class="img-fluid rounded mb-3 mb-md-0" src="http://placehold.it/700x300" alt="">',
		        '</a>',
		      '</div>',
		      '<div class="col-md-5">',
		        '<h3>Media One</h3>',
		        '<p>',
		        '<div class="row">',
		          '<div class="col-md-5">',
		           ' key here',
		          '</div>',
		          '<div class="col-md-7">',
		            'value here',
		          '</div>',
		        '</div>',
		        '<p>Lorem ipsum dolor sit amet, consectetur adipisicing elit. Laudantium veniam exercitationem expedita laborum at voluptate. Labore, voluptates totam at aut nemo deserunt rem magni pariatur quos perspiciatis atque eveniet unde.</p>',
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
}

module.exports = {
	loadDetail: loadDetail
};
