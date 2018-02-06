const ProjectF = require('./js/project.js')
const Project = ProjectF.Project

function createProject(){
	var remote = electron.remote;
	var store = remote.getGlobal('sharedObj').store;

	var name = document.getElementById("name-input").value;
	var desc = document.getElementById("desc-input").value;
	var files = document.getElementById("files-input").value;

	if (store.getProject(name) != null) {
		// display: "Project name already used. Please input new name"
	} else if (name == null) {
		// display: "Please give a project name"
	} else {
		console.log(require.resolve('electron'));
		console.log(name);
		console.log(desc);
		console.log(files);
		var proj = new Project(name, desc);
		proj.saveProject();
	}
}

$("#new-project").submit(function(e) {
	e.preventDefault();
	createProject();
})

(function () {
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
          console.log("hello");
        }

        holder.ondrop = (e) => {
            e.preventDefault();

            for (let f of e.dataTransfer.files) {
                console.log('File(s) you dragged here: ', f.path)
            }

            return false;
        };
    })();
