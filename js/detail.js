const electron = require('electron')
const path = require('path')
const fs = require('fs')
const remote = require('electron').remote
const Image = require('./image.js')
const getProjectJsonPath = require('./project.js').getProjectJsonPath
const loadProject = require('./project.js').loadProject
const Mustache = require('Mustache')
const ExifImage = require('exif').ExifImage;

var _data = [];

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
  	//loadImages(project);
	var images = project.loadImages();
	console.log(images);
	for (var key in images) {
		var img_path = images[key]['path'];
		var name = images[key]['name'];
		detailExifDisplay(img_path, name);
	}
}

function loadImages(project){
	// Add each image in project into details.html
	var images = project.loadImages();
	// for (image in images){
	for (var id = 0; id < 2; id++){
		var data = {
		    name: "Image #" + id,
		    path: "image._path",
		    phone: "image._phone",
			exifData: null
		}

		// var data = image.getMetadata();
		// data[name] = image.getName();
		// data[path] = image.getPath();
		mdata = '';
		count = 0;
		for (var key in data) {
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

function insertDetailTemplate(data, id) {
	imgdata = '';
	exifdata = '';
	gpsdata = '';
	count = 0;
	var dataForCsv = {'Image Name': id};
	for (var key in data.exifData.image) {
		dataForCsv[key] = data.exifData.image[key];
		if (count == 0) {
			imgdata += '<tr><td>' + key + ': ' + data.exifData.image[key] + '</td>';
			count = 1;
		} else {
			imgdata += '<td>' + key + ': ' + data.exifData.image[key] + '</td></tr>';
			count = 0;
		}
	}
	count = 0;
	for (var key in data.exifData.exif) {
		dataForCsv[key] = data.exifData.exif[key];
		if (count == 0) {
			exifdata += '<tr><td>' + key + ': ' + data.exifData.exif[key] + '</td>';
			count = 1;
		} else {
			exifdata += '<td>' + key + ': ' + data.exifData.exif[key] + '</td></tr>';
			count = 0;
		}
	}
	count = 0;
	for (var key in data.exifData.gps) {
		dataForCsv[key] = data.exifData.exif[key];
		if (count == 0) {
			gpsdata += '<tr><td>' + key + ': ' + data.exifData.gps[key] + '</td>';
			count = 1;
		} else {
			gpsdata += '<td>' + key + ': ' + data.exifData.gps[key] + '</td></tr>';
			count = 0;
		}
	}

	_data.push(dataForCsv);

	var template = [
			'<div id="detail-template" class="row">',
				'<div class="col-md-4">',
					'<a href="#">',
						'<img class="img-fluid rounded mb-3 mb-md-0" src="{{path}}" alt="">',
					'</a>',
				'</div>',
				'<div class="col-md-8">',
					'<h3>{{name}}</h3>',
					'<p>',
					'<span><button class="btn btn-primary mb-2" data-toggle="collapse" data-target="#imagedata' + id + ' ">Image Info</button></span>',
					'<div id="imagedata' + id +' " class="container collapse">',
						'<table class="table table-bordered">',
							imgdata,
						'</table>',
					'</div>',
					'<span><button class="btn btn-primary mb-2" data-toggle="collapse" data-target="#exifdata' + id + ' ">Exif Data</button></span>',
					'<div id="exifdata' + id +' " class="container collapse">',
						'<table class="table table-bordered">',
							exifdata,
						'</table>',
					'</div>',
					'<br><br>',
					'<span><button class="btn btn-primary mb-2" data-toggle="collapse" data-target="#gpsdata' + id + ' ">GPS Data</button></span>',
					'<div id="gpsdata' + id +' " class="container collapse">',
						'<table class="table table-bordered">',
							gpsdata,
						'</table>',
					'</div>',
				'</div>',
			'</div>',
			'<hr>'
	].join("\n");
	// template: '<div ...>\n<h1 ...>{{title}}<h1>\n</div>'

	var filler = Mustache.render(template, data);
	$("#image-wrapper").append(filler);
}

function loadHeader(project) {
  template = [
    "<h1 id='name-header' class='my-4'>{{projName}}",
      "<small>{{projDesc}}</small>",
			"<button type='' class='btn btn-primary float-right mb-2' id='export{{projName}}'>",
				"Export to CSV",
			"</button>",
    "</h1>",
  ].join("\n");
  data = {
    projName: project._projectName,
    projDesc: project._description,
  }
  var filler = Mustache.render(template, data);
  $("#detail-header").append(filler);
	$("#export" + project._projectName).click(function() {
		electron.remote.dialog.showSaveDialog(function(filename, bookmark) {
			var csvString = "";
			var keys = new Set();
			for (var row = 0; row < _data.length; row++) {
				Object.keys(_data[row]).map(function(key) {
					keys.add(key);
				});
			}
			var csvHeader = "";
			keys.forEach(function(k) {
				csvHeader += k + ",";
			});
			csvString += csvHeader.slice(0, csvHeader.length - 1);
			csvString += "\n";
			var rowString = "";
			for (var row = 0; row < _data.length; row++) {
				keys.forEach(function(k) {
					if (_data[row][k] != undefined) {
						console.log(k + ", " + _data[row][k]);
						var value = _data[row][k].toString();
						if (value.includes(',')) {
							rowString += '"' + value + '",';
						} else {
							rowString += _data[row][k] + ",";
						}
					}
					else {
						rowString += ",";
					}
				});
				csvString += rowString.slice(0, rowString.length - 1);
				csvString += "\n";
			}
			fs.writeFileSync(filename+".csv", csvString);
		});
	});
}

function clearDetailsHtml(){
	// clear previous projects on the html
	document.getElementById("detail-header").innerHTML = ""
	document.getElementById("image-wrapper").innerHTML = ""
}

function detailExifDisplay(imgpath, name) {
	try {
		new ExifImage({ image : imgpath }, function (error, exifData) {
				if (error)
						console.log('Error: '+error.message);
				else {
						var data = {
							'name': name,
							'path': imgpath,
							'exifData': {},
						};

						var types = ['exif', 'image', 'gps'];
						for (var ind in types) {
							var type = types[ind];
							data.exifData[type] = exifData[type];
							if (!data.exifData[type]) {
								data.exifData[type] = {};
							}
							if ('MakerNote' in data.exifData.exif) {
								delete data.exifData.exif['MakerNote'];
							}
							// for (var key in exifData[type]) {
							// 	var val = exifData[type][key];
							// 	if (val.constructor.name === 'Number' || val.constructor.name ==='String') {
							// 		data['exifData'][key] = val;
							// 	}
							// }
						}
						insertDetailTemplate(data, name);
				}
		});
	} catch (error) {
			console.log('Exif Error: ' + error.message);
	}
}

module.exports = {
	loadDetail: loadDetail
};
