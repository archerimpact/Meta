const electron = require('electron')
const path = require('path')
const fs = require('fs')
const remote = require('electron').remote
const getProjectJsonPath = require('./project.js').getProjectJsonPath
const loadProject = require('./project.js').loadProject
const Mustache = require('Mustache')
const ExifImage = require('exif').ExifImage;

var _data = [];
var _currentProj;
var paths_global;
//var storage = remote.getGlobal('sharedObj').store;

function loadDetail(projectName){
	clearDetailsHtml();
	var projectPath = getProjectJsonPath(projectName);
	var project = loadProject(projectPath);
	_currentProj = project;

	redirect('detail');
	loadHeader(project);
	var images = project.getImages();
	images.sort(compareTimestamp);
	// console.log("images: " + images);
	images.forEach(function(image) {
		var img_path = image['path'];
		var name = image['name'];
		var metadata = image['metadata'];
		// console.log(metadata);
		detailExifDisplay(img_path, name, metadata);
	});
}

// Comparator that puts newer images before older ones.
function compareTimestamp(image1, image2){
	if (image1['timestamp'] > image2['timestamp'])
		return -1;
	else if (image1['timestamp'] == image2['timestamp'])
		return 0;
	else
		return 1;
}

function insertDetailTemplate(data, id) {
	imgdata = '';
	exifdata = '';
	gpsdata = '';
	count = 0;
	if (data.error) {
		insertErrorTemplate(data, id);
		return;
	}
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
		dataForCsv[key] = data.exifData.gps[key];
		if (count == 0) {
			gpsdata += '<tr><td>' + key + ': ' + data.exifData.gps[key] + '</td>';
			count = 1;
		} else {
			gpsdata += '<td>' + key + ': ' + data.exifData.gps[key] + '</td></tr>';
			count = 0;
		}
	}
	if (gpsdata === '') {
		gpsdata = '<tr><td>No GPS information available for this image</td></tr>'
	}
	if (exifdata === '') {
		exifdata = '<tr><td>No Exif information available for this image</td></tr>'
	}
	if (imgdata === '') {
		imgdata = '<tr><td>No capture information available for this image</td></tr>'
	}

	_data.push(dataForCsv);

	var template = [
			'<div class="col-md-4">',
				'<a href="#">',
					'<img class="img-fluid rounded mb-3 mb-md-0" src="{{path}}" alt="">',
				'</a>',
			'</div>',
			'<div class="col-md-8">',
				'<div class="row">',
					'<div class="col-md-9">',
						'<h3 style="word-wrap:break-word;">{{name}}</h3>',
					'</div>',
					'<div class="col-md-3">',
						'<div class="dropdown">',
							'<button class="btn btn-outline-secondary float-right dropdown-toggle" type="button" id="dropdown' + id + '" data-toggle="dropdown" aria-haspopup="true" aria-expanded="false">',
								// '<span class="octicon octicon-gear"></span>',
								'Options',
							'</button>',
							'<div class="dropdown-menu" aria-labelledby="dropdown' + id + '">',
								'<li id="remove{{name}}" class="dropdown-item">Remove</li>',
								'<li id="rename{{name}}" class="dropdown-item">Rename</li>',
								'<li class="dropdown-item">Star</li>',
							'</div>',
						'</div>',
					'</div>',
				'</div>',
				// '<br>',
				'<span><button class="btn btn-primary mb-2" data-toggle="collapse" data-target="#imagedata' + id + ' ">Image Info</button></span>',
				'<div id="imagedata' + id +' " class="container collapse">',
					'<table class="table table-bordered">',
						imgdata,
					'</table>',
				'</div>',
				'<br>',
				'<span><button class="btn btn-primary mb-2" data-toggle="collapse" data-target="#exifdata' + id + ' ">Exif Data</button></span>',
				'<div id="exifdata' + id +' " class="container collapse">',
					'<table class="table table-bordered">',
						exifdata,
					'</table>',
				'</div>',
				'<br>',
				'<span><button class="btn btn-primary mb-2" data-toggle="collapse" data-target="#gpsdata' + id + ' ">GPS Data</button></span>',
				'<div id="gpsdata' + id +' " class="container collapse">',
					'<table class="table table-bordered">',
						gpsdata,
					'</table>',
					'<div style="width:100%;" id="map{{name}}"></div>',
				'</div>',
			'</div>',
	].join("\n");

	var filler = Mustache.render(template, data);
	$("#detail-template" + data.name).append(filler);

	setPhotoRemove(data.name);

	if ('GPSLongitude' in data.exifData.gps && 'GPSLatitude' in data.exifData.gps) {
		loadMap(
			data.name,
			data.exifData.gps.GPSLatitude,
			data.exifData.gps.GPSLongitude,
			data.exifData.gps.GPSLatitudeRef,
			data.exifData.gps.GPSLongitudeRef,
		);
	}
}

function insertErrorTemplate(data, id) {
	if (data.error && data.error.includes('no such file')) {
		data.error = 'This file could not be found. Is it possible ' +
			'that it was moved? If so, either put it back, or delete ' +
			'this entry and re-add it in its new location.'
	}
	var template = [
			'<div class="col-md-4">',
				'<a href="#">',
					'<img class="img-fluid rounded mb-3 mb-md-0" src="{{path}}" alt="">',
				'</a>',
			'</div>',
			'<div class="col-md-8">',
				'<div class="row">',
					'<div class="col-md-9">',
						'<h3 style="word-wrap:break-word;" style="display: inline;">{{name}}</h3>',
					'</div>',
					'<div class="col-md-3">',
						'<div style="display: inline;" class="dropdown">',
							'<button class="btn btn-outline-secondary float-right dropdown-toggle" type="button" id="dropdown' + id + '" data-toggle="dropdown" aria-haspopup="true" aria-expanded="false">',
								// '<span class="octicon octicon-gear"></span>',
								'Options',
							'</button>',
							'<div class="dropdown-menu" aria-labelledby="dropdown' + id + '">',
								'<li id="remove{{name}}" class="dropdown-item" href="#">Remove</li>',
								// '<li class="dropdown-item" href="#">Rename</li>',
								// '<li class="dropdown-item" href="#">Star</li>',
							'</div>',
						'</div>',
					'</div>',
				'</div>',
				// '<p>',
				'<div id="imagedata' + id +' ">',
						'<br>',
						'<div class="alert alert-warning">',
							'<strong>Sorry! </strong>' + data.error,
						'</div>',
				'</div>',
			'</div>',
	].join("\n");

	var filler = Mustache.render(template, data);
	document.getElementById("detail-template" + data.name).innerHTML += filler;

	setPhotoRemove(data.name);
	// setPhotoRename(data.name);
}

function loadMap(name, lat, long, latref, longref) {
	lat = tripleToDegree(lat);
	long = tripleToDegree(long);
	if (latref.toLowerCase().includes('s') && lat > 0) {
		lat = -1 * lat;
	}
	if (longref.toLowerCase().includes('w') && long > 0) {
		long = -1 * long;
	}
	// console.log(lat, long);
	_map = new google.maps.Map(document.getElementById('map' + name), {
	  zoom: 15,
	  center: {'lat': lat, 'lng': long},
	});
	var marker = new google.maps.Marker({
    position: {'lat': lat, 'lng': long},
    map: _map,
  });
	var div = document.getElementById('map' + name);
	var width = div.offsetWidth
	div.style.height = '500px';
	if (width > 0) {
		div.style.height = width.toString() + 'px';
	}
}

function tripleToDegree(dms) {
	if (typeof dms[Symbol.iterator] === 'function') {
		return dms[0] + dms[1]/60 + dms[2]/3600;
	}
	return dms;
}

function setPhotoRemove(name) {
	var projName = document.getElementById('project-name').innerHTML;
	console.log(name)
	var elem = document.getElementById("remove" + name)
	if (!elem) {
		return;
	}
	elem.onclick = function() {
		var projectPath = storage.getProject(projName);
		console.log(projectPath);
		console.log(projName);
		console.log(storage)
		var proj = loadProject(path.join(projectPath, projName + '.json'));
		proj.removeImage(name);
		proj.saveProject();
		var content = document.getElementById('detail-template' + name);
		content.parentNode.removeChild(content);
		var line = document.getElementById('hr' + name);
		line.parentNode.removeChild(line);
		for (var row = 0; row < _data.length; row++) {
			if (_data[row]['Image Name'] == name) {
				_data.splice(row, 1);
				break;
			}
		}
	};
}

// function setPhotoRename(name) {
// 	var projName = document.getElementById('project-name').innerHTML;
// 	document.getElementById("rename" + name).onclick = function() {
// 		var projectPath = storage.getProject(projName);
// 		console.log(projectPath);
// 		console.log(projName);
// 		var proj = loadProject(path.join(projectPath, projName + '.json'));
// 		var image = proj.loadImage(name);
// 		if (!image) {
// 			console.log('image not found');
// 			return;
// 		}
// 		var oldName = name;
// 		var input = document.getElementById("input-new" + name);
// 		input.style.display = "none";
// 		//var newName = document.get
// 		//image.rename()
// 	}
// }

function loadHeader(project) {
  template = [
		"<div class='row'>",
			"<div class='col-md-10'>",
		    "<h1 id='name-header' class='my-4' style='word-wrap:break-word;'>{{displayName}}</h1>",
				"<h4 style='word-wrap:break-word;'>{{projDesc}}</h4>",
			"</div>",
			"<div class='col-md-2'>",
				"<br><br><br>",
				"<button type='' class='btn btn-primary float-right mb-2' id='export{{projName}}'>",
					"Export to CSV",
				"</button>",
				'<br>',
				"<button type='' class='btn btn-danger float-right mb-2' id='delete{{projName}}'>",
					"Delete Project",
				"</button>",
				"<br>",
				"<button type='' id='upload{{projName}}' class='btn btn-primary float-right mb-2'>Add Image</button>",
				"<br>",
			"</div>",
			"<div id='project-name' hidden=true>{{projName}}</div>",
		"</div>"
  ].join("\n");
  data = {
    projName: project.getName(),
		displayName: project.getName().replace(/__/g, " "),
    projDesc: project.getDescription(),
  }
  var filler = Mustache.render(template, data);
  $("#detail-header").append(filler);

	document.getElementById("export" + project.getName()).onclick = function() {
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
			var rowString;
			for (var row = 0; row < _data.length; row++) {
				rowString = "";
				keys.forEach(function(k) {
					if (_data[row][k]) {
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
	};

	document.getElementById("delete" + project.getName()).onclick = function() {
		var ans = confirm("Are you sure you want to delete this project?");
		if (ans) {
			project.eliminate();
			redirect('projects');
		}
	};

	document.getElementById("upload" + project.getName()).onclick = function() {
		console.log('hello');
		let paths = electron.remote.dialog.showOpenDialog({properties: ['openFile', 'multiSelections']});
		for (var index in paths) {
			var filename = path.basename(paths[index]).split(".")[0];
			project.addImage(filename, paths[index]);
			project.saveProject();
		}

		clearDetailsHtml();
		loadDetail(project.getName());
	};
}

function clearDetailsHtml() {
	// clear previous projects on the html
	_data = [];
	document.getElementById("detail-header").innerHTML = ""
	document.getElementById("image-wrapper").innerHTML = ""
	// document.getElementById("file-label2").innerHTML = ""
}

function detailExifDisplay(imgpath, name, metadata) {
	// Set default template.
	var template = [
		'<div id="detail-template{{name}}" class="row">',
		'</div>',
		'<hr id="hr{{name}}">'
	].join("\n")
	var filler = Mustache.render(template, {name: name});
	$("#image-wrapper").append(filler);
	if (!metadata) {
		metadata = {};
	}

	if (Object.keys(metadata).length == 0) {
		try {
			console.log("generating metadata for " + name);
			new ExifImage({ image : imgpath }, function (error, exifData) {
					var data = {
						'name': name,
						'path': imgpath,
						'exifData': {},
						'error': "",
					};
					if (error) {
							console.log('Error: ' + error.message);
							data.error = error.message;
					} else {
							var types = ['exif', 'image', 'gps'];
							for (var ind in types) {
								var type = types[ind];
								data.exifData[type] = exifData[type];
								if (!data.exifData[type]) {
									data.exifData[type] = {};
								}
								// these are not web-formatted and look like random symbols
								// consider looking into formatting these
								delete data.exifData.exif['MakerNote'];
								delete data.exifData.exif['UserComment'];
							}
					}
					_currentProj.setImageMetadata(name, data);
					_currentProj.saveProject();
					insertDetailTemplate(data, name);
			});
		} catch (error) {
				console.log('Exif Error: ' + error.message);
		}
	} else {
		console.log("using existing metadata for " + name);
		insertDetailTemplate(metadata, name);
	}
}

$("#add-image").submit(function(e) {
	e.preventDefault();
	if (!paths_global) {
		console.log('Please select images');
		alert('Please select images');
		return;
	}
	var proj = _currentProj;
	for (var index in paths_global) {
		var filename = path.basename(paths_global[index]).split(".")[0];
		proj.addImage(filename, paths_global[index]);
		proj.saveProject();
	}

	clearDetailsHtml();
	loadDetail(proj.getName());
	paths_global = null;
});

module.exports = {
	loadDetail: loadDetail
};
