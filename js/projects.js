const Mustache = require('Mustache');
const loadProject = require('./js/project.js').loadProject
const remote = require('electron').remote;
const fs = require('fs');

function showProject(name, desc, imgsrc) {
  template = [
    "<div class='col-lg-4 col-sm-6 portfolio-item'>",
      "<div class='card h-100'>",
        "<a id='photo-{{name}}' href='#'><img class='card-img-top' src='{{imgsrc}}' alt=''></a>",
        "<div class='card-body'>",
          "<h4 class='card-title'>",
            "<a id='link-{{name}}' href='#'>{{name}}</a>",
          "</h4>",
          "<p class='card-text'>{{desc}}</p>",
          "<a class='btn btn-primary' id='btn-{{name}}' href='#'>View</a>",
        "</div>",
      "</div>",
    "</div>",
  ].join("\n");
  data = {
    name: name.toString(),
    desc: desc,
    imgsrc: imgsrc,
  };
  var filler = Mustache.render(template, data);
  $("#projects-body").append(filler);
  document.getElementById('link-' + name.toString()).onclick = function() {
    loadDetail(name.toString());
  };
  document.getElementById('btn-' + name.toString()).onclick = function() {
    loadDetail(name.toString());
  };
  document.getElementById('photo-' + name.toString()).onclick = function() {
    loadDetail(name.toString());
  };
}

// use this sort of thing

function populateProjectsScreen() {
  var storage = remote.getGlobal('sharedObj').store;
  var lib = storage.getAllProjects();
  for (var proj in lib) {
    var projectPath = lib[proj] + '/' + proj + '.json';
  	var project = loadProject(projectPath);
    if (!project) {
      storage.deleteProject(proj);
    } else {
      // uncomment this when images working
      var imgsrc = project.getImages()[0];
      if (!fs.existsSync(imgsrc)) {
        imgsrc = "https://static1.squarespace.com/static/5a6557ae692ebe609770a2a7/t/5a67a1be0852291d033bb08b/1518849801599/?format=1500w";
      }
      showProject(project.getName(), project.getDescription(), imgsrc);// "https://upload.wikimedia.org/wikipedia/commons/d/d1/Mount_Everest_as_seen_from_Drukair2_PLW_edit.jpg");
    }
  }
}
populateProjectsScreen()

function refreshProjects() {
  document.getElementById("projects-body").innerHTML = "";
  populateProjectsScreen()
}
