const load_detail = require('./js/detail.js').loadDetail
var sqlite3 = require('sqlite3').verbose();

var paths_global = [];
var database = electron.remote.getGlobal('sharedObj').db;

function alert_image_upload(bool, project_name, img_path, index, num_images) {
	if (!bool) {
		alert("Unable to add image");
		return
	} else if (index == num_images - 1) {
		console.log("added all images");

		/* Load project view. */
		load_detail(project_name);
	}
}

function populate_project_with_images(bool, project_name, img_paths) {
	if (!bool) {
		alert("Unable to create project");
		return
	}

	/* Populate newly created project with provided images. */
	for (var index in img_paths) {
		var filename = path.basename(img_paths[index]).split(".")[0];
		database.add_image(filename, img_paths[index], project_name, index, img_paths.length, alert_image_upload);
	}
}

function createProject(){
	var name = document.getElementById("name-input").value;
	name = name.replace(/ /g, '__');
	name = name.replace(/'/g, '__');
	name = name.replace(/"/g, '__');
	name = name.replace(/;/g, '__');

	var desc = document.getElementById("desc-input").value;
	// file paths stored in paths_global

	if (!name) {
		// display: "Please give a project name"
		console.log("Please give a project name");
		alert("Please provide a project name");
		return
	} else if (unacceptableFormat(name)) {
		console.log("Please provide a valid project name. Commas, slashes, and periods cannot be used.");
		alert("Please provide a valid project name. Commas, slashes, and periods cannot be used.");
	}

	database.add_project(name, desc, paths_global, populate_project_with_images);

	return name;
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
      	load_detail(projectName);
		// refreshProjects();
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
