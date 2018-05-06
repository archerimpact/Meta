const Mustache = require('Mustache');
const loadProject = require('./js/project.js').loadProject
const remote = require('electron').remote;
const fs = require('fs');

var lib = storage.getAllProjects();

function showProject(name, desc, imgsrc) {
  var displayName = name.replace(/__/g, " ");
  template = [
    "<div class='col-lg-4 col-sm-6 portfolio-item'>",
      "<div class='card h-100'>",
        "<a id='photo-{{name}}' href='#'><img class='card-img-top img-responsive' src='{{imgsrc}}' alt=''></a>",
        "<div class='card-body'>",
          "<h4 class='card-title'>",
            "<a id='link-{{name}}' href='#'>{{displayName}}</a>",
          "</h4>",
          "<p class='card-text text-truncate'>{{desc}}</p>",
          "<a class='btn btn-primary' id='btn-{{name}}' href='#'>View</a>",
        "</div>",
      "</div>",
    "</div>",
  ].join("\n");
  data = {
    displayName: displayName,
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

function showNewProject() {
  data = {};
  template = [
    "<div class='col-lg-4 col-sm-6 portfolio-item'>",
      "<div class='card h-100'>",
        "<a id='new-project-photo' href='#'><img data-section='new' class='card-img-top img-responsive' src='./assets/add-proj.png' alt=''></a>",
        "<div class='card-body'>",
          "<h4 class='card-title'>",
            "<a id='new-photo-link' href='#'></a>",
          "</h4>",
          "<p class='card-text'></p>",
          "<a data-section='new' class='btn btn-primary js-scroll-trigger' id='new-photo-btn' href='#'>Add New Project</a>",
        "</div>",
      "</div>",
    "</div>",
  ].join("\n");

  var filler = Mustache.render(template, data);
  $("#projects-body").append(filler);
}

function populateProjectsScreen() {
  // var storage = remote.getGlobal('sharedObj').store;
  lib = storage.getAllProjects();
  showNewProject();
  var proj_list = [];
  for (var proj in lib) {
    proj_list.push(proj);
  }

  proj_list.sort(compareTimestamp);

  proj_list.forEach(function (proj) {
    var project = getProject(proj);
    if (!project) {
      storage.deleteProject(proj);
    } else {
      // uncomment this when images working
      if (project.getImages()[0]) {
        var imgsrc = project.getImages()[0]['path'];
      } else {
        imgsrc = ""
      }
      if (imgsrc == "" || !fs.existsSync(imgsrc)) {
        imgsrc = "https://static1.squarespace.com/static/5a6557ae692ebe609770a2a7/t/5a67a1be0852291d033bb08b/1518849801599/?format=1500w";
      }
      showProject(project.getName(), project.getDescription(), imgsrc);// "https://upload.wikimedia.org/wikipedia/commons/d/d1/Mount_Everest_as_seen_from_Drukair2_PLW_edit.jpg");
    }
  })
}
populateProjectsScreen()

function getProject(projName) {
  if (!(projName in lib)) {
    return null;
  }
  var projectPath = lib[projName] + '/' + projName + '.json';
  var project = loadProject(projectPath);
  return project;
}

// Comparator that puts newer projects before older ones.
function compareTimestamp(proj1, proj2){
  var p1 = getProject(proj1);
  var p2 = getProject(proj2);
  if (!p2) {
    return -1;
  }
  if (!p1) {
    return 1;
  }
  if (p1.getLastModified() > p2.getLastModified())
    return -1;
  else if (p1.getLastModified() == p2.getLastModified())
    return 0;
  else
    return 1;
}

function refreshProjects() {
  document.getElementById("projects-body").innerHTML = "";
  populateProjectsScreen()
}
