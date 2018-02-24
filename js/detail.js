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
  console.log("project path detail");
  console.log(projectPath);
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
	console.log('loadImages')
	for (var image in images) {
		// var data = {
		//     name: "Image #" + id,
		//     path: "image._path",
		//     phone: "image._phone",
		// 	exifData: null
		// }

		var data = image.getInfo();
		mdata = '';
		count = 0;
		console.log('starting add metadata')
		for (var key in data['meta']) {
			console.log('metadata')
			if (count == 0) {
				mdata += '<tr><td>' + key + ': ' + data[key] + '</td>';
				count = 1;
			} else {
				mdata += '<td>' + key + ': ' + data[key] + '</td></tr>';
				count = 0;
			}
			
		}

		var template = [
		    '<div id="detail-template" class="row">',
		      '<div class="col-md-4">',
		        '<a href="#">',
		          '<img class="img-fluid rounded mb-3 mb-md-0" src="http://placehold.it/700x300" alt="">',
		        '</a>',
		      '</div>',
		      '<div class="col-md-8">',
		        '<h3>{{name}}</h3>',
		        '<p>',
		        '<div id="metadata' + id +' " class="container collapse">',
				  '<table class="table table-bordered">',
				  	mdata,
				  '</table>',
				'</div>',
		        '<span><button class="btn btn-primary mb-2" data-toggle="collapse" data-target="#metadata' + id + ' ">Metadata</button></span>',
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
