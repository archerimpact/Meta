const Mustache = require('Mustache');
const remote = require('electron').remote;
const fs = require('fs');
const loadDetail = require('./js/detail.js').loadDetail;


var database = electron.remote.getGlobal('sharedObj').db;

function showProject(name, desc, imgsrc) {
  var displayName = name.replace(/__/g, " ");
  template = [
    "<div class='col-lg-4 col-sm-6 portfolio-item'>",
      "<div class='card h-100'>",
        "<a id='photo-{{name}}' href='#'><img style='width: 100%; height: 30vw; object-fit: cover' class='card-img-top img-responsive' src='{{imgsrc}}' alt=''></a>",
        "<div class='card-block well'>",
          "<h4 class='card-title'>",
            "<a style='padding: 0px; margin: -10px; color: #192d42' id='link-{{name}}' href='#'>{{displayName}}</a>",
          "</h4>",
          "<p style='padding: 0; color: 192d42' class='card-text text-truncate'>{{desc}}</p>",
          "<a class='btn btn-primary' style='background-color: #192d42; color: white' id='btn-{{name}}' href='#'>View</a>",
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
        "<a id='new-project-photo' href='#'><img style='width: 100%; height: 30vw; object-fit: cover' data-section='new' class='card-img-top img-responsive' src='./assets/add-proj.png' alt=''></a>",
        "<div class='card-block well'>",
          "<h4 class='card-title'>",
            "<a id='new-photo-link' href='#'></a>",
          "</h4>",
          "<p class='card-text'></p>",
          "<a data-section='new' class='btn btn-primary js-scroll-trigger' style='background-color: #192d42; color: white' id='new-photo-btn' href='#'>Add New Project</a>",
        "</div>",
      "</div>",
    "</div>",
  ].join("\n");

  var filler = Mustache.render(template, data);
  $("#projects-body").append(filler);
}

function populateProjectsScreen() {
  database.get_projects(function (projects_list) {
    showNewProject();

    projects_list.sort(compareTimestamp);

    projects_list.forEach(function (proj) {
      database.get_project_thumbnail(proj['name'], function (thumbnail_path) {
        if (thumbnail_path == "" || !fs.existsSync(thumbnail_path)) {
          thumbnail_path = "https://static1.squarespace.com/static/5a6557ae692ebe609770a2a7/t/5a67a1be0852291d033bb08b/1518849801599/?format=1500w";
        }
        showProject(proj['name'], proj['description'], thumbnail_path);// "https://upload.wikimedia.org/wikipedia/commons/d/d1/Mount_Everest_as_seen_from_Drukair2_PLW_edit.jpg");
      });
    });
  });
}

function getProject(projName) {
  if (!(projName in lib)) {
    return null;
  }
  var projectPath = lib[projName] + '/' + projName + '.json';
  var project = loadProject(projectPath);
  return project;
}

// Comparator that puts newer projects before older ones.
function compareTimestamp(proj1, proj2) {
  if (!proj1 || !proj2) {
    return -1;
  }

  if (proj1["last_modified"] > proj2["last_modified"])
    return -1;
  else if (proj1["last_modified"] == proj2["last_modified"])
    return 0;
  else
    return 1;
}

function refreshProjects() {
  document.getElementById("projects-body").innerHTML = "";
  populateProjectsScreen()
}
