const ProjectF = require('./js/project.js')
const Project = ProjectF.Project

function createProject(){
	var remote = electron.remote;
	var store = remote.getGlobal('sharedObj').store;

	var name = document.getElementById("name").value;
	var desc = document.getElementById("description").value;

	if (store.getProject(name) != null) {
		// display: "Project name already used. Please input new name"
	} else if (name == null) {
		// display: "Please give a project name"
	} else {
		console.log(require.resolve('electron'));
		var proj = new Project(name, desc);
		proj.saveProject();
	}
}