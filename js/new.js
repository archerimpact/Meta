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

	if (store.getProject(name) != null) {
		// display: "Project name already used. Please input new name"
	} else if (name == "") {
		// display: "Please give a project name"
        console.log("Please give a project name");
        return
	} else {
		console.log(name);
		console.log(desc);
		console.log(files);
		
		var proj = new Project(name, desc);
		proj.saveProject();
		for (var index in paths_global) {
			var split = paths_global[index].split("/");
			var filename = split[split.length -1].split(".")[0];
			proj.addImage(filename, path);
		}
        return name
	}
}

$("#new-project").submit(function(e) {
	e.preventDefault();
	console.log(e);
	var projectName = createProject();
    if (projectName) {
        loadDetail(projectName);
    } else {
        console.log("project is null")
    }
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
		paths_global = paths;
		document.getElementById("file-label").innerHTML = String(paths_global.length) + " files selected"
	}

	holder.ondrop = (e) => {
	    e.preventDefault();
			paths_global = e.dataTransfer.files;
			document.getElementById("file-label").innerHTML = String(paths_global.length) + " files selected"
	    return false;
	};
}

setupload();
