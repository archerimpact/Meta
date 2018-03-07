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
var _currentProj;
var paths_global;
var storage = remote.getGlobal('sharedObj').store;

function loadDetail(projectName){
	clearDetailsHtml();
	var projectPath = getProjectJsonPath(projectName);
	var project = loadProject(projectPath);
	_currentProj = project;
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
	var images = project.getImages();
	console.log(images)
	var id = image.len - 1;
	for (var image in images) {
		id--;
		// var data = {
		//     name: "Image #" + id,
		//     path: "image._path",
		//     phone: "image._phone",
		// 	exifData: null
		// }

		insertImage(image, id);
	}

}

function insertImage(image, id) {
	var mdata = '';
	var count = 0;
	console.log('starting add metadata')
	for (var key in image['meta']) {
		console.log('metadata')
		if (count == 0) {
			mdata += '<tr><td>' + key + ': ' + image[key] + '</td>';
			count = 1;
		} else {
			mdata += '<td>' + key + ': ' + image[key] + '</td></tr>';
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
	        '<div id="metadata' + image['name'] + id +' " class="container collapse">',
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
			'<div id="detail-template{{name}}" class="row">',
				'<div class="col-md-4">',
					'<a href="#">',
						'<img class="img-fluid rounded mb-3 mb-md-0" src="{{path}}" alt="">',
					'</a>',
				'</div>',
				'<div class="col-md-8">',
					'<div class="row">',
						'<div class="col-md-10">',
							'<h3 style="word-wrap:break-word;">{{name}}</h3>',
						'</div>',
						'<div class="col-md-2">',
							'<div class="dropdown">',
								'<button class="btn btn-outline-secondary float-right dropdown-toggle" type="button" id="dropdown' + id + '" data-toggle="dropdown" aria-haspopup="true" aria-expanded="false">',
									// '<span class="octicon octicon-gear"></span>',
									'Options',
								'</button>',
								'<div class="dropdown-menu" aria-labelledby="dropdown' + id + '">',
									'<li id="remove{{name}}" class="dropdown-item">Remove</li>',
									'<li class="dropdown-item">Rename</li>',
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
			'</div>',
			'<hr>'
	].join("\n");
	// template: '<div ...>\n<h1 ...>{{title}}<h1>\n</div>'

	var filler = Mustache.render(template, data);
	$("#image-wrapper").append(filler);

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
			'<div id="detail-template{{name}}" class="row">',
				'<div class="col-md-4">',
					'<a href="#">',
						'<img class="img-fluid rounded mb-3 mb-md-0" src="{{path}}" alt="">',
					'</a>',
				'</div>',
				'<div class="col-md-8">',
					'<div class="row">',
						'<div class="col-md-10">',
							'<h3 style="word-wrap:break-word;" style="display: inline;">{{name}}</h3>',
						'</div>',
						'<div class="col-md-2">',
							'<div style="display: inline;" class="dropdown">',
								'<button class="btn btn-outline-secondary float-right dropdown-toggle" type="button" id="dropdown' + id + '" data-toggle="dropdown" aria-haspopup="true" aria-expanded="false">',
									// '<span class="octicon octicon-gear"></span>',
									'Options',
								'</button>',
								'<div class="dropdown-menu" aria-labelledby="dropdown' + id + '">',
									'<li id="remove{{name}}" class="dropdown-item" href="#">Remove</li>',
									'<li class="dropdown-item" href="#">Rename</li>',
									'<li class="dropdown-item" href="#">Star</li>',
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
			'</div>',
			'<hr>'
	].join("\n");
	// template: '<div ...>\n<h1 ...>{{title}}<h1>\n</div>'

	var filler = Mustache.render(template, data);
	$("#image-wrapper").append(filler);

	setPhotoRemove(data.name);
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
	console.log(lat, long);
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
	$("#remove" + name).click(function() {
		var projectPath = storage.getProject(projName);
		console.log(projectPath);
		console.log(projName);
		var proj = loadProject(path.join(projectPath, projName + '.json'));
		proj.removeImage(name);
		proj.saveProject();
		$('#detail-template' + name).remove();
		for (var row = 0; row < _data.length; row++) {
			if (_data[row]['Image Name'] == name) {
				_data.splice(row, 1);
				break;
			}
		}
	});
}

function loadHeader(project) {
  template = [
		"<div class='row'>",
			"<div class='col-md-10'>",
		    "<h1 id='name-header' class='my-4'>{{displayName}}</h1>",
				"<h4>{{projDesc}}</h4>",
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
    projName: project._projectName,
		displayName: project._projectName.replace(/__/g, " "),
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
	});

	$("#delete" + project._projectName).click(function() {
		var ans = confirm("Are you sure you want to delete this project?");
		if (ans) {
			project.eliminate();
			redirect('projects');
		}
	});

	$("#upload" + project._projectName).click(function() {
		console.log('hello');
		let paths = electron.remote.dialog.showOpenDialog({properties: ['openFile', 'multiSelections']});
		for (var index in paths) {
			var filename = path.basename(paths[index]).split(".")[0];
			project.addImage(filename, paths[index]);
			project.saveProject();
		}

		clearDetailsHtml();
		loadDetail(project.getName());
	});
}

function clearDetailsHtml() {
	// clear previous projects on the html
	_data = [];
	document.getElementById("detail-header").innerHTML = ""
	document.getElementById("image-wrapper").innerHTML = ""
	// document.getElementById("file-label2").innerHTML = ""
}

function detailExifDisplay(imgpath, name) {
	try {
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

							// for (var key in exifData[type]) {
							// 	var val = exifData[type][key];
							// 	if (val.constructor.name === 'Number' || val.constructor.name ==='String') {
							// 		data['exifData'][key] = val;
							// 	}
							// }
						}
				}
				insertDetailTemplate(data, name);
		});
	} catch (error) {
			console.log('Exif Error: ' + error.message);
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
	console.log(proj);
	for (var index in paths_global) {
		var filename = path.basename(paths_global[index]).split(".")[0];
		proj.addImage(filename, paths_global[index]);
		proj.saveProject();
	}

	clearDetailsHtml();
	loadDetail(proj.getName());
	paths_global = null;

	// var projectName = createProject();
 //    if (projectName) {
 //    	clearNew();
 //      	loadDetail(projectName);
	// 	refreshProjects();
 //    } else {
 //        console.log(projectName + ": project not created")
 //    }

});

// function setuploadDetails() {
// 	console.log('setting upload');
// 	var holder = document.getElementById('upload2');
// 	if (!holder) {
// 		console.log('upload element does not exist');
// 	  return false;
// 	}

// 	holder.ondragover = () => {
// 	    return false;
// 	};

// 	holder.ondragleave = () => {
// 	    return false;
// 	};

// 	holder.ondragend = () => {
// 	    return false;
// 	};

// 	holder.onclick = () => {
// 		console.log('clicked');
// 	  	let paths = electron.remote.dialog.showOpenDialog({properties: ['openFile', 'multiSelections']});
// 		if (!paths) {
// 			return false;
// 		}
// 		paths_global = paths;
// 		document.getElementById("file-label2").innerHTML = String(paths_global.length) + " files selected"
// 	};

// 	holder.ondrop = (e) => {
// 	    e.preventDefault();
// 			var paths = e.dataTransfer.files;
// 			if (!paths) {
// 				return false;
// 			}
// 			paths_global = paths;
// 			document.getElementById("file-label2").innerHTML = String(paths_global.length) + " files selected"
// 	    return false;
// 	};
// }

// setuploadDetails();

module.exports = {
	loadDetail: loadDetail
};
