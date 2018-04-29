const loadDetail = require('./js/detail.js').loadDetail
var sqlite3 = require('sqlite3').verbose();

var paths_global = [];

function createProject(){
	var name = document.getElementById("name-input").value;
	name = name.replace(/ /g, '__');
	name = name.replace(/'/g, '__');
	name = name.replace(/"/g, '__');
	name = name.replace(/;/g, '__');

	var desc = document.getElementById("desc-input").value;
	// file paths stored in paths_global

	var database = electron.remote.getGlobal('sharedObj').db;
	console.log("database: " + database)

	if (!name) {
		// display: "Please give a project name"
		console.log("Please give a project name");
		alert("Please provide a project name");
		return
	} else if (unacceptableFormat(name)) {
		console.log("Please provide a valid project name. Commas, slashes, and periods cannot be used.");
		alert("Please provide a valid project name. Commas, slashes, and periods cannot be used.");
	}

	database.has_project(name, create_project_if_doesnt_exist);

	database.create_project(name, desc);

	for (var index in paths_global) {
		var filename = path.basename(paths_global[index]).split(".")[0];
		database.add_image(filename, paths_global[index]);
	}

	console.log('Create project finished: ' + name)
  	return name;
	
}

/**
 *
 * Callback function used for has_project(). Decides whether to invoke the
 * asynchronous create_project() function.
 *
 **/
function create_project_if_doesnt_exist(bool, name) {
	if (!bool) {
		// project already exists
		console.log("Project name already used");
		alert("Project name already in use");
  	return
	}

	// project doesn't exist
	database.create_project(name, desc, populate_project_with_images);
}

function populate_project_with_images(bool, project_name, paths_global) {
	if (!bool) {
		console.log("unable to create project")
	}
}

function unacceptableFormat(name) {
	return name.includes(".") || name.includes("/") || name.includes(",") ||
				 name.includes("\\") || name.includes(">") || name.includes("<");
}

$("#new-project").submit(function(e) {
	e.preventDefault();
	var projectName = createProject();
    if (projectName) {
    	clearNew();
      	loadDetail(projectName);
		refreshProjects();
    } else {
        console.log(projectName + ": project not created")
    }
});

function clearNew() {
	paths_global = [];
	document.getElementById("name-input").value = ""
	document.getElementById("desc-input").value = ""
	document.getElementById("file-label").innerHTML = ""
}

function setupload() {
	console.log('setting upload');
	var holder = document.getElementById('upload');
	if (!holder) {
		console.log('upload element does not exist');
	  return false;
	}

	holder.ondragover = () => {
	    return false;
	};

	holder.ondragleave = () => {
	    return false;
	};

	holder.ondragend = () => {
	    return false;
	};

	holder.onclick = () => {
	  let paths = electron.remote.dialog.showOpenDialog({properties: ['openFile', 'multiSelections']});
		if (!paths) {
			return false;
		}
		paths_global = paths;
		document.getElementById("file-label").innerHTML = String(paths_global.length) + " files selected"
	};

	holder.ondrop = (e) => {
	    e.preventDefault();
			var paths = e.dataTransfer.files;
			if (!paths) {
				return false;
			}
			paths_global = paths;
			document.getElementById("file-label").innerHTML = String(paths_global.length) + " files selected"
	    return false;
	};
}

setupload();
