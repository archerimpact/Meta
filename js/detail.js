const electron = require('electron')
const path = require('path')
const fs = require('fs')
const remote = require('electron').remote
const Mustache = require('Mustache')
// const ExifImage = require('exif').ExifImage;
const { ExifTool } = require("exiftool-vendored");
const exiftool = new ExifTool();
const Chart = require('chart.js');
// const echarts = require('echarts');
// const select2 = require('select2');
const Choices = require('Choices.js')

var _data = [];
var _currentProj;
var paths_global;
var database = electron.remote.getGlobal('sharedObj').db;

function alert_image_upload(bool, project_name, img_path, index, num_images) {
	if (!bool) {
		alert("Unable to add image");
		return
	} else if (index == num_images - 1) {
		/* Load project view. */
		load_detail(project_name);
	}
}

function delete_project_callback(bool) {
	if (bool) {
		redirect('projects');
	} else {
		alert("Unable to delete project");
	}
}

function loadDetail(projectName) {
	_currentProj = projectName;

	clearDetailsHtml();

	redirect('detail');

	/* Display project header. */
	database.get_project(projectName, function(row) {
		loadHeader(row);
	});
	loadCharts();
	selectPrep();
	/* Display images in this project. */
	database.get_images_in_project(projectName, function(projectName, image_list) {
		image_list.sort(compareTimestamp);

		image_list.forEach(function(image) {
			var image_path = image['path'];
			var name = image['img_name'];
			database.get_image_metadata(image_path, name, projectName, function(bool, name, path, projectName, metadata) {
				//detailExifDisplay(image_path, name, projectName, metadata);
				detailExifDisplay__NEW(img_path, name, metadata);
			});
		});
	});
}

/* Comparator that puts newer images before older ones. */
function compareTimestamp(image1, image2){
	if (image1['last_modified'] > image2['last_modified'])
		return -1;
	else if (image1['last_modified'] == image2['last_modified'])
		return 0;
	else
		return 1;
}

function insert_detail_template_callback(bool, img_name, img_path, proj_name, metadata_row) {
	if (bool) {
		var data = {
				'name': img_name,
				'path': img_path,
				'exifData': {},
				'gpsData': {},
				'fileData': {},
				'error': "",
			};
		for (var key in metadata_row) {
			data.exifData[key] = metadata_row[key];
		}
		data = processData(data);
		populate_detail_view(data, img_name);
	} else {
		insertErrorTemplate(metadata_row, img_name);
		return;
	}
}

function populate_detail_view(data, id) {
	if (data.error) {
		insertErrorTemplate(data, id);
		return;
	}
	var contents = {};
	var disableds = {};
	var types = ['exif', 'gps', 'file', 'fav'];
	for (var ind in types) {
		var name = types[ind]
		var category = data[name + 'Data'];
		var content = '';
		count = 0;
		for (var key in category) {
			if (count == 0) {
				content += '<tr>';
			}
			content += '<td style="padding:1.0rem"><strong>' + key + '</strong>: ' + category[key] + '</td>';
			if (count == 2) {
				content += '</tr>'
			}
			count = (count + 1) % 3;
		}
		if (content == '') {
			disableds[name] = 'disabled';
		} else {
			disableds[name] = '';
		}
		if (content && !content.endsWith('</tr>')) {
			content += '</tr>';
		}
		contents[name] = content
	}

	// _data.push(dataForCsv);

	var flag_string = 'Flagged as modified';
	var is_modified = false
	// TODO implement flag trigger
	if (contents['exif'].toLowerCase().includes('adobe')) {
		flag_string = 'File modified by Adobe software.'
		is_modified = true

	}
	var flag_trigger = 'hidden';
	if (is_modified) {
		flag_trigger = '';
	}

	var template = [
		'<div class="row">',
			'<div class="col-md-4">',
				'<img class="img-fluid rounded mb-3 mb-md-0" src="{{path}}" alt="">', // add image features here
			'</div>',
			'<div class="col-md-8">',
				'<div class="row">',
					'<div class="col-md-8">',
						'<h3 style="word-wrap:break-word;">{{name}}</h3>',
						// tags
						'<div>',
							'<input type="text" placeholder="Add tag" name="tag">',
							// one new label per tag, with appropriate color
							'<h3 style="display:inline">',
								'<span class="badge badge-pill badge-primary">', //style="background-color:#00ffff">',
									'Fun',
								'</span> ',
								'<span class="badge badge-pill badge-primary" style="background-color:#00ffff">',
									'Party',
								'</span> ',
							'</h2>',
						'</div>',
						'<br>',
						'<textarea class="form-control" rows="3" placeholder="Notes" />',
					'</div>',
					'<div class="col-md-4">',

						'<div class="row">',
							'<img src="./assets/alert.svg" style="height:40px" data-toggle="tooltip" data-placement="auto" ' + flag_trigger + ' title="' + flag_string + '"/>',
							'<div class="dropdown">',
								'<button class="btn btn-outline-secondary float-right dropdown-toggle" type="button" id="dropdown' + id + '" data-toggle="dropdown" aria-haspopup="true" aria-expanded="false">',
									'Options',
								'</button>',
								'<div class="dropdown-menu" aria-labelledby="dropdown' + id + '">',
									'<li id="remove{{name}}" class="dropdown-item">Remove</li>',
									'<li id="rename{{name}}" class="dropdown-item">Rename</li>',
								'</div>',
							'</div>',
						'</div>',
						// search bar
						'<br>',
						'<input type="text" placeholder="Exif search">',
						'<tr><th> Search results </th></tr>',

					'</div>',
				'</div>',
			'</div>',
		'</div>',

		'<div class="row container-fluid" style="height:20px"></div>',

		'<div class="container-fluid row">',
			'<div class="col-md-3 text-center">',
				'<span><button class="btn btn-primary mb-2" data-toggle="collapse" data-target="#favdata' + id + ' "' + disableds.fav + '>Favorite fields</button></span>',
			'</div>',
			'<div class="col-md-3 text-center">',
				'<span><button class="btn btn-primary mb-2" data-toggle="collapse" data-target="#filedata' + id + ' "' + disableds.file + '>File Info</button></span>',
			'</div>',
			'<div class="col-md-3 text-center">',
				'<span><button class="btn btn-primary mb-2" data-toggle="collapse" data-target="#exifdata' + id + ' "' + disableds.exif + '>Exif Data</button></span>',
			'</div>',
			'<div class="col-md-3 text-center">',
				'<span><button class="btn btn-primary mb-2" data-toggle="collapse" data-target="#gpsdata' + id + ' "' + disableds.gps + '>GPS Data</button></span>',
			'</div>',
		'</div>',

		'<div class="container-fluid row">',
			'<div class="col-md-12 center-block">',
				// favorites
				'<div id="favdata' + id +' " class="container collapse">',
					'<table class="table table-bordered">',
						contents.fav,
					'</table>',
				'</div>',
				'<br>',
				//file info
				'<div id="filedata' + id +' " class="container collapse">',
					'<table class="table table-bordered">',
						contents.file,
					'</table>',
				'</div>',
				'<br>',
				// general Exif
				'<div id="exifdata' + id +' " class="container collapse">',
					'<table class="table table-bordered">',
						contents.exif,
					'</table>',
				'</div>',
				'<br>',
				// GPS
				'<div id="gpsdata' + id +' " class="container collapse">',
					'<table class="table table-bordered">',
						contents.gps,
					'</table>',
					'<div id="map{{name}}" style="width:100%;height:400px"></div>',
				'</div>',
			'</div>',
		'</div>',
	].join("\n");

	var filler = Mustache.render(template, data);
	$("#detail-template" + data.name).append(filler);

	var latitude;
	var longitude;
	if ('GPSLatitude' in data.gpsData) {
		latitude = data.gpsData.GPSLatitude
		longitude = data.gpsData.GPSLongitude
	}
	// addMap(
	// 	"map" + data.name,
	// 	[{'lat':latitude, 'lng':longitude}],
	// )

	$('[data-toggle="tooltip"]').tooltip();

	setPhotoRemove(data.name);

}

/* TODO(Varsha): change this so that we populate the metadata using dict returned by db. */
function insertDetailTemplate(img_name, img_path, proj_name) {
	database.get_image_metadata(img_path, img_name, proj_name, insert_detail_template_callback);
}

function insertErrorTemplate(error, id) {
	// TODO find out what the analog of this is for the new module
	// if (data.error && data.error.includes('no such file')) {
	// 	data.error = 'This file could not be found. Is it possible ' +
	// 		'that it was moved? If so, either put it back, or delete ' +
	// 		'this entry and re-add it in its new location.'
	// }

	if (error && error.toString().includes('no such file')) {
		error = 'This file could not be found. Is it possible ' +
			'that it was moved? If so, either put it back, or delete ' +
			'this entry and re-add it in its new location.'
	}
	var template = [
			'<div class="col-md-4">',
				'<a href="#">',
					'<img class="img-responsive rounded" src="{{path}}" alt="">',
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
				'<div id="imagedata' + id +' ">',
						'<br>',
						'<div class="alert alert-warning">',
							'<strong>Sorry! </strong>' + error,
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
	var elem = document.getElementById("remove" + name)
	if (!elem) {
		return;
	}
	elem.onclick = function() {
		database.remove_image(projName, name, function() {
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
		});
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
    projName: project['name'],
		displayName: project['name'].replace(/__/g, " "),
    projDesc: project['description'],
  }
  var filler = Mustache.render(template, data);
  $("#detail-header").append(filler);

	document.getElementById("export" + project['name']).onclick = function() {
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

	document.getElementById("delete" + project['name']).onclick = function() {
		var ans = confirm("Are you sure you want to delete this project?");
		if (ans) {
			database.delete_project(project['name'], delete_project_callback);
		}
	};

	document.getElementById("upload" + project['name']).onclick = function() {
		let paths = electron.remote.dialog.showOpenDialog({properties: ['openFile', 'multiSelections']});
		for (var index in paths) {
			var filename = path.basename(paths[index]).split(".")[index];
			database.add_image(filename, paths[index], project['name'], index, paths.length, alert_image_upload);
		}
	};
}

function clearDetailsHtml() {
	// clear previous projects on the html
	_data = [];
	document.getElementById("detail-header").innerHTML = ""
	document.getElementById("image-wrapper").innerHTML = ""
	document.getElementById("detail-charts").innerHTML = ""
	// document.getElementById("file-label2").innerHTML = ""
}

function detail_exif_display_callback(bool) {
	console.log("added exif to db: " + bool);
}

function processData(data) {
	var file = [
		"SourceFile",
		"Directory",
		"FileType",
		"FileTypeExtension",
		"FileModifyDate",
		"FileAccessDate",
		"FilePermissions",
		"FileInodeChangeDate",
		"MIMEType",
		"FileName",
		"ExifToolVersion",
		"FileSize",
		"ExifByteOrder",
	]
	var favorites = getFavDataKeys();
	for (var key in data.exifData) {
		if (key == "errors" && !isStr(data.exifData[key])) {
			delete data.exifData[key];
		}
		if (file.includes(key)) {
			data.fileData[key] = data.exifData[key]
			delete data.exifData[key];
		}
		if (favorites.includes(key)) {
			data.favData[key] = data.exifData[key]
			delete data.exifData[key];
		}
		if (key.toLowerCase().includes("gps")) {
			data.gpsData[key] = data.exifData[key];
			delete data.exifData['key'];
		}
	}
	return data;
}

//TODO return favorite fields as strings in array
function getFavDataKeys() {
	return [];
}

function detailExifDisplay(imgpath, imgname, projname, metadata) {
	// Set default template.
	var template = [
		'<div id="detail-template{{name}}" class="row">',
		'</div>',
		'<hr id="hr{{name}}">'
	].join("\n")
	var filler = Mustache.render(template, {name: imgname});
	$("#image-wrapper").append(filler);
	if (!metadata) {
		metadata = {};
	}

	if (Object.keys(metadata).length == 0) {
		try {
			console.log("generating metadata for " + imgname);

			exiftool
				.read(imgpath)
				.then(function(tags) {
					database.add_image_meta(imgpath, projname, tags, detail_exif_display_callback);
					insertDetailTemplate(imgname, imgpath, projname);
					// insertDetailTemplate__NEW(data, name);
				})
				.catch(function(error) {
					console.error(error);
					data.error = error;
					insertErrorTemplate(error, imgname)
				});
		} catch (error) {
			console.log('Exif Error: ' + error.message);
			insertErrorTemplate(error, imgname);
		}
	} else {
		console.log("using existing metadata for " + imgname);
		insertDetailTemplate(imgname, imgpath, projname);
	}
}

function isStr(maybeString) {
	return maybeString && !(maybeString == "");
}

$("#add-image").submit(function(e) {
	e.preventDefault();
	if (!paths_global) {
		console.log('Please select images');
		alert('Please select images');
	}

	for (var index in paths_global) {
		var filename = path.basename(paths_global[index]).split(".")[0];
		database.add_image(filename, paths_global[index], _currentProj, alert_image_upload);
	}

	loadDetail(_currentProj);
	paths_global = null;
});

module.exports = {
	loadDetail: loadDetail
};

/*
** Need to look into resource conservation here, by creating a new exiftool
** only when needed, then calling .end() after it is done batch processing
** (it does also have a batch mode)
*/
function detailExifDisplay__NEW(imgpath, name, metadata) {
	var data = {
		'name': name,
		'path': imgpath,
		'exifData': {},
		'gpsData': {},
		'fileData': {},
		'error': "",
	};
	var template = [
		'<div id="detail-template{{name}}" class="row">',
		'</div>',
		'<hr id="hr{{name}}">'
	].join("\n")
	var filler = Mustache.render(template, {name: name});
	$("#image-wrapper").append(filler);
	// if (Object.keys(metadata).length > 0) {
	// 	data.exifData = metadata;
	// 	insertDetailTemplate__NEW(data, name);
	// 	return;
	// }
	exiftool
		.read(imgpath)
		.then(function(tags) {
			data.exifData = {};
			for (var key in tags) {
				data.exifData[key] = tags[key];
				data = processData(data);
			}
			insertDetailTemplate__NEW(data, name);
		})
		.catch(function(error) {
			console.error(error);
			data.error = error;
			insertDetailTemplate__NEW(data, name);
		});
}

// format of data is
// {
//  error: String ("" if no error)
//  name: String (photo name)
//  path: String
// 	exifData: {...}
//  favData: {...}
//  gpsData: {...}
//  fileData: {...}
// }
function insertDetailTemplate__NEW(data, id) {
	data.id = id
	if (data.error) {
		insertErrorTemplate(data, id);
		return;
	}
	var contents = {};
	var disableds = {};
	var types = ['exif', 'gps', 'file', 'fav'];
	for (var ind in types) {
		var name = types[ind]
		var category = data[name + 'Data'];
		var content = '';
		content += '<div class="table-responsive table-condensed">'
		content += '<table class="table">'
		content += '<tbody>'
		count = 0;
		var hasData = false
		for (var key in category) {
			var hasData = true;
			if (count == 0) {
				content += '<tr>';
			}
			content += '<td style="padding:1.0rem"><strong>' + key + '</strong>: ' + category[key] + '</td>';
			if (count == 1) {
				content += '</tr>'
			}
			count = 1 - count;
		}
		if (!hasData) {
			disableds[name] = 'disabled';
		} else {
			disableds[name] = '';
		}
		if (content.includes('<tr>') && !content.endsWith('</tr>')) {
			content += '</tr>';
		}
		content += '</tbody></table></div>'
		hasData = false
		contents[name] = content
	}

	// _data.push(dataForCsv);

	var flag_string = 'Flagged as modified';
	var is_modified = false
	// TODO implement flag trigger
	if (contents['exif'].toLowerCase().includes('adobe')) {
		flag_string = 'File modified by Adobe software.'
		is_modified = true

	}
	var flag_trigger = 'hidden';
	if (is_modified) {
		flag_trigger = '';
	}
	data.flag = flag_trigger
	data.flag_str = flag_string

	var template = [
		'<div class="row">',
			'<div class="col-md-4">',
				'<div class="row name-row">',
					'<h3 class="image-name">{{name}}</h3>',
					'<div class="dropdown" style="display:inline; float:right">',
						'<button class="settings-button btn btn-outline-secondary float-right dropdown-toggle" type="button" id="dropdown' + id + '" data-toggle="dropdown" aria-haspopup="true" aria-expanded="false">',
							'<i class="material-icons icon" style="height:25px;width:15px;font-size:15px;">settings</i>',
						'</button>',
						'<ul class="dropdown-menu" aria-labelledby="dropdown' + id + '">',
							'<li id="remove{{name}}" class="dropdown-item"><a href="#">Remove</a></li>',
							'<li id="rename{{name}}" class="dropdown-item"><a href="#">Rename</a></li>',
						'</ul>',
					'</div>',
					'<img class="{{flag}}" src="./assets/alert.svg" style="height:25px; display:inline; float:right;" data-toggle="tooltip" data-placement="auto" title="{{flag_str}}"/>',
				'</div>',
				'<img class="img-responsive rounded" src="{{path}}" alt="">', // add image features here
			'</div>',
			'<div class="col-md-8">',
				'<div class="row">',
					'<div class="col-md-7">',

						// tags
						'<input type="text" class="choices-tags form-control choices__input is-hidden" id="tags{{name}}" multiple>',

						// accordian for exif display
							'<div id="exif-accordian{{id}}" role="tablist" aria-multiselectable="true">',

								'<div class="panel panel-default data-panel">',
								  '<div class="panel-heading accordian-header">',
										'<div class="" role="tab" id="trigger-fav{{id}}" style="display:inline">',
											'<a class="collapsed accordian-link" data-toggle="collapse" data-parent="#exif-accordian{{id}}" href="#display-fav{{id}}" aria-expanded="false" aria-controls="display-fav{{id}}">',
												'Favorite',
											'</a>',
										'</div>',
								  	'<div class="" role="tab" id="trigger-file{{id}}" style="display:inline">',
											'<a class="collapsed accordian-link" data-toggle="collapse" data-parent="#exif-accordian{{id}}" href="#display-file{{id}}" aria-expanded="false" aria-controls="display-file{{id}}">',
												'File',
											'</a>',
										'</div>',
									  '<div class="" role="tab" id="trigger-exif{{id}}" style="display:inline">',
											'<a class="collapsed accordian-link" data-toggle="collapse" data-parent="#exif-accordian{{id}}" href="#display-exif{{id}}" aria-expanded="true" aria-controls="display-exif{{id}}">',
												'Exif',
											'</a>',
										'</div>',
								    '<div class="" role="tab" id="trigger-gps{{id}}" style="display:inline">',
											'<a class="collapsed accordian-link" data-toggle="collapse" data-parent="#exif-accordian{{id}}" href="#display-gps{{id}}" aria-expanded="true" aria-controls="display-gps{{id}}">',
												'GPS',
											'</a>',
										'</div>',
								  '</div>',
									'<div id="display-fav{{id}}" class="panel-collapse collapse accordian-body" role="tabpanel" aria-labelledby="trigger-fav{{id}}">',
										'<div class="panel-body">',
											contents.fav,
										'</div>',
									'</div>',
								  '<div id="display-file{{id}}" class="panel-collapse collapse accordian-body" role="tabpanel" aria-labelledby="trigger-file{{id}}">',
										'<div class="panel-body">',
											contents.file,
										'</div>',
									'</div>',
								  '<div id="display-exif{{id}}" class="panel-collapse collapse accordian-body" role="tabpanel" aria-labelledby="trigger-exif{{id}}">',
										'<div class="panel-body">',
											contents.exif,
										'</div>',
									'</div>',
								  '<div id="display-gps{{id}}" class="panel-collapse collapse accordian-body" role="tabpanel" aria-labelledby="trigger-gps{{id}}">',
										'<div class="panel-body">',
											contents.gps,
										'</div>',
									'</div>',
								'</div>',

							'</div>',
							//accordian ends


					'</div>',
					'<div class="col-md-5">',
						// notes
						'<textarea class="form-control notes" rows="3" placeholder="Notes" />',
						// search bar
						'<select class="form-control choices__input is-hidden" id="search{{name}}" multiple></select>',
					'</div>',
				'</div>',
			'</div>',
		'</div>',

		'<div class="row container-fluid" style="height:20px"></div>',
	].join("\n");

	var filler = Mustache.render(template, data);
	$("#detail-template" + data.name).append(filler);

	var latitude;
	var longitude;
	if ('GPSLatitude' in data.gpsData) {
		latitude = data.gpsData.GPSLatitude
		longitude = data.gpsData.GPSLongitude
	}
	addMap(
		"map" + data.name,
		[{'lat':latitude, 'lng':longitude}],
	)

	$('[data-toggle="tooltip"]').tooltip();

	setPhotoRemove(data.name);

	var tags = getTagsForName(data.name);

	var choices = new Choices($('#tags' + data.name)[0], {
		items: tags,
		removeItemButton: true,
		editItems: true,
		duplicateItems: false,
		placeholderValue: "Add a tag",
	})

	var choices = new Choices($('#search' + data.name)[0], {
		choices: data.ref,
		paste: false,
		duplicateItems: false,
		placeholder: "Enter/select a tag",
		itemSelectText: '',
		duplicateItems: true,
		placeholderValue: "Search Exif data",
	})

}

//TODO
function getTagsForName(name) {
	return [
		{
			value: 'Outdoors',
			label: 'Outdoors',
		},
		{
			value: 'Berkeley',
			label: 'Berkeley',
		}
	]
}
function isStr(maybeString) {
	return maybeString && !(maybeString == "");
}

function processData(data) {
	data.ref = []
	var file = [
		"SourceFile",
		"Directory",
		"FileType",
		"FileTypeExtension",
		"FileModifyDate",
		"FileAccessDate",
		"FilePermissions",
		"FileInodeChangeDate",
		"MIMEType",
	]
	var favories = getFavDataKeys();
	for (var key in data.exifData) {
		var val = data.exifData[key];
		data.ref.push({
		  value: '',
		  label: key + ": " + val,
		  selected: false,
		  disabled: false,
		})
		if (key == "errors" && !isStr(data.exifData[key])) {
			delete data.exifData[key];
		}
		if (file.includes(key)) {
			data.fileData[key] = data.exifData[key]
			delete data.exifData[key]
		}
		if (favories.includes(key)) {
			data.favData[key] = data.exifData[key]
			delete data.exifData[key]
		}
		if (key.toLowerCase().includes("gps")) {
			data.gpsData[key] = data.exifData[key];
			delete data.exifData['key']
		}
	}
	return data
}

//TODO return favorite fields as strings in array
function getFavDataKeys() {
	return []
}

function loadCharts() {
	template = [
		'<div class="row container-fluid">',
			'<div class="col-sm-6 col-xs-12">',
				'<div class="x_panel">',
					'<div class="clearfix"></div>',
					'<div class="x_content">',
						'<canvas id="lineChart"></canvas>',
					'</div>',
				'</div>',
			'</div>',
			'<div class="col-sm-6 col-xs-12">',
				'<div style="width:100%;" id="trendsmap"></div>',
			'</div>',
		'</div>',
		'<div class="row contriner-fluid">',
			'<div class=" col-md-4 col-xs-12">',
				'<div class="clearfix"></div>',
				'<div class="panel-group">',
					'<div class="panel panel-default">',
						'<div class="panel-body">',
							'<canvas id="pie1"></canvas>',
						'</div>',
					'</div>',
				'</div>',
			'</div>',
			'<div class=" col-md-4 col-xs-12">',
				'<div class="clearfix"></div>',
				'<div class="panel panel-default">',
					'<canvas id="pie2"></canvas>',
				'</div>',
			'</div>',
			'<div class=" col-md-4 col-xs-12">',
				'<div class="clearfix"></div>',
				'<div class="x_content">',
					'<canvas id="pie3"></canvas>',
				'</div>',
			'</div>',
		'</div>',
	].join("\n");

	$("#detail-charts").append(template);

	addLineChart(
		"lineChart",
		["2000", "2001", "2002", "2003", "2004"],
		"Photos Taken",
		[100, 200, 400, 50, 350]
	)
	addPieChart(
		"pie1",
		["Cannon", "Nikon", "Apple", "Samsung"],
		[25, 40, 100, 20],
		"Cameras"
	)
	addPieChart(
		"pie2",
		["Cannon", "Nikon", "Apple", "Samsung"],
		[25, 40, 100, 20],
		"Data"
	)
	addPieChart(
		"pie3",
		["Cannon", "Nikon", "Apple", "Samsung"],
		[25, 40, 100, 20],
		"Stuff"
	)
	addMap(
		"trendsmap",
		[
			{'lat':10, 'lng':10},
			{'lat':20, 'lng':20},
		]
	)
	var ref = document.getElementById('lineChart');
	var div = document.getElementById('trendsmap')
	var width = ref.offsetWidth / 2
	if (width > 0) {
		div.style.height = width.toString() + 'px';
	} else {
		div.style.height = '400px';
	}

}

// THIS IS NOT WORKING
function selectPrep() {
	var ts = $(".tag-selector");
	// ts.select2({
  	// 	tags: true
	// });
}
