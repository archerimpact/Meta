const ProjectF = require('./js/project.js')
const Project = ProjectF.Project
const loadDetail = require('./js/detail.js').loadDetail

var paths_global = [];

function createProject(){
	var remote = electron.remote;
	var store = remote.getGlobal('sharedObj').store;

	var name = document.getElementById("name-input").value;
	var desc = document.getElementById("desc-input").value;
	// file paths stored in paths_global

	if (!name) {
		// display: "Please give a project name"
		console.log("Please give a project name");
		alert("Please provide a project name");
		return
	} else if (store.getProject(name) != null) {
		// display: "Project name already used. Please input new name"
    	console.log("Project name already used");
		alert("Project name already in use");
    	return
	} else {
		console.log("creating project");
		var proj = new Project(name, desc);
		console.log(paths_global);
		for (var index in paths_global) {
			var split = paths_global[index].split("/");
			var filename = split[split.length -1].split(".")[0];
			proj.addImage(filename, paths_global[index]);
		}
		proj.saveProject();
    return name;
	}
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
	document.getElementById("name-input").value = ""
	document.getElementById("desc-input").value = ""
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
		console.log('clicked');
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
