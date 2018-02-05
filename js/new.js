const Project = require('./js/project.js')

function createProject(){
	var remote = electron.remote;
	var store = remote.getGlobal('sharedObj').store;

	var name = document.getElementById("name").value;
	var desc = document.getElementById("description").value;

	if (store.getProject(name) != null) {
		// display: "Project name already used. Please input new name"
	} else if (name == null || desc == null) {
		// display: "Please give a project name and description"
	} else {
		var proj = new Project(name, desc);
		proj.saveProject();
	}
}