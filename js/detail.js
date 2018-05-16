const electron = require('electron')
const path = require('path')
const fs = require('fs')
const remote = require('electron').remote
const getProjectJsonPath = require('./project.js').getProjectJsonPath
const loadProject = require('./project.js').loadProject
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
//var storage = remote.getGlobal('sharedObj').store;

function loadDetail(projectName){
	clearDetailsHtml();
	var projectPath = getProjectJsonPath(projectName);
	var project = loadProject(projectPath);
	_currentProj = project;
	$('#slidebutton').removeClass('hidden');

	redirect('detail');
	loadHeader(project);
	loadCharts();
	var images = project.getImages();
	images.sort(compareTimestamp);
	images.forEach(function(image) {
		var img_path = image['path'];
		var name = image['name'];
		var metadata = image['metadata'];
		//detailExifDisplay(img_path, name, metadata);
		detailExifDisplay__NEW(img_path, name, metadata)
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

function insertErrorTemplate(data, id) {
	// TODO find out what the analog of this is for the new module
	// if (data.error && data.error.includes('no such file')) {
	// 	data.error = 'This file could not be found. Is it possible ' +
	// 		'that it was moved? If so, either put it back, or delete ' +
	// 		'this entry and re-add it in its new location.'
	// }
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
		var projectPath = storage.getProject(projName);
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
	document.getElementById("detail-charts").innerHTML = ""
	document.getElementById("drawer-select").innerHTML = '<h3 style="margin-left: 10px;">Filter Images</h3>'
	// document.getElementById("file-label2").innerHTML = ""
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
		});
		// .catch(function(error) {
		// 	console.error(error);
		// 	data.error = error;
		// 	insertDetailTemplate__NEW(data, name);
		// });
}

function getType(info) {
	info = info.toLowerCase()
	if (
		info.includes('jpg') ||
		info.includes('jpeg') ||
		info.includes('png') ||
		info.includes('svg') ||
		info.includes('gif') ||
		info.includes('apng') ||
		info.includes('pdf') ||
		info.includes('bmp')
	) {
		return 'img'
	} else if (
		info.includes('mp4') ||
		info.includes('mov') ||
		info.includes('mpeg') ||
		info.includes('mpg') ||
		info.includes('avi') ||
		info.includes('wmv') ||
		info.includes('ogg') ||
		info.includes('webm')
	) {
		return 'video'
	} else {
		//default to image
		return 'img'
	}
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
	insertIntoSlideMenu(data, id)
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

	data.media = getType(contents.file)
	data.sorry = "Sorry, we are not able to display this file. Consider inspecting it on your computer at {{path}}. However, there may still be exif data displayed to the right."

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
				'<{{media}} class="img-responsive rounded" src="{{path}}" alt="{{sorry}}" controls>',
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

	var tagElem = $('#tags' + data.name)[0]
	if (tagElem) {
		var choices = new Choices(tagElem, {
			items: tags,
			removeItemButton: true,
			editItems: true,
			duplicateItems: false,
			placeholderValue: "Add a tag",
		})
	}

	var searchElem = $('#search' + data.name)[0]
	if (searchElem) {
		var choices = new Choices(searchElem, {
			choices: data.ref,
			paste: false,
			duplicateItems: false,
			placeholder: "Enter/select a tag",
			itemSelectText: '',
			duplicateItems: true,
			placeholderValue: "Search Exif data",
		})
	}

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

function insertIntoSlideMenu(data, id) {
	var menu_row = [
		'<label class="menu-check"><input id="{{name}}check" type="checkbox" checked> {{name}}</label>',

	].join("/n")
	var row = Mustache.render(menu_row, data);
	$('#drawer-select').append(row);

	var elem = document.getElementById(data.name.toString() + 'check')
	if (!elem) {
		return;
	}
	elem.onclick = function() {
		$('#detail-template' + data.name).toggleClass('hidden')
		$('#hr' + data.name).toggleClass('hidden');
	};
}
