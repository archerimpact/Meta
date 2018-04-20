const ProjectF = require('./js/project.js')
const Project = ProjectF.Project
const loadDetail = require('./js/detail.js').loadDetail

var paths_global = [];

function createProject(){
	var sqlite3 = require('sqlite3').verbose();
	var db_filename = './db/meta.db'

	var db = new sqlite3.Database(':memory:', (err) => {
	if (err) {
	  console.error(err.message);
	}

	// if meta.db was just created, create Images and Projects tables.


	console.log('Connected to the meta database.');
	});
	db.serialize(function() {
	  db.run("CREATE TABLE lorem (info TEXT)");

	  var stmt = db.prepare("INSERT INTO lorem VALUES (?)");
	  for (var i = 0; i < 10; i++) {
	      stmt.run("Ipsum " + i);
	  }
	  stmt.finalize();

	  db.each("SELECT rowid AS id, info FROM lorem", function(err, row) {
	      console.log(row.id + ": " + row.info);
	  });
	});

	db.close();

	var remote = electron.remote;
	// var store = remote.getGlobal('sharedObj').store;

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
	} else if (storage.getProject(name) != null) {
		// display: "Project name already used. Please input new name"
    	console.log("Project name already used");
		alert("Project name already in use");
    	return
	} else if (unacceptableFormat(name)) {
		console.log("Please provide a valid project name. Commas, slashes, and periods cannot be used.");
		alert("Please provide a valid project name. Commas, slashes, and periods cannot be used.");
	} else {
		var proj = new Project(name, desc);
		for (var index in paths_global) {
			var filename = path.basename(paths_global[index]).split(".")[0];
			proj.addImage(filename, paths_global[index]);
		}
		proj.saveProject();
    	return name;
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
