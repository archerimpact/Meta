function createProject(){
	var remote = require('electron').remote;
	store = remote.store;

	var name = document.getElementById("name").value;
	var desc = document.getElementById("description").value;

	if (store.getProject(name) != null) {
		// display: "Project name already used. Please input new name."
	} else {
		var proj = Project(store);
		proj.updateProjectName(name);
		proj.updateDescription(desc);
	}
}