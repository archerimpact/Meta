const ProjectF = require('./js/project.js')
const Project = ProjectF.Project

var paths_global = [];

function createProject(){
	var remote = electron.remote;
	var store = remote.getGlobal('sharedObj').store;

	var name = document.getElementById("name-input").value;
	var desc = document.getElementById("desc-input").value;
	// file paths stored in paths_global

	if (store.getProject(name) != null) {
		// display: "Project name already used. Please input new name"
	} else if (name == null) {
		// display: "Please give a project name"
	} else {
		console.log(require.resolve('electron'));
		var proj = new Project(name, desc);
		proj.saveProject();
		for (var index in paths_global) {
			var split = paths_global[index].split("/");
			var filename = split[split.length -1].split(".")[0];
			proj.addImage(filename, path);
		}
	}
}

$("#new-project").submit(function(e) {
	e.preventDefault();
	console.log(e);
	createProject();
	redirect('landing')
});

function setupload() {
	var holder = document.getElementById('upload');
	if (!holder) {
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
	}

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
