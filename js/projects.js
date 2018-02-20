const Mustache = require('Mustache');
const loadProject = require('./js/project.js').loadProject

function showProject(name, desc, imgsrc) {
  template = [
    "<div class='col-lg-4 col-sm-6 portfolio-item'>",
      "<div class='card h-100'>",
        "<a href='#'><img class='card-img-top' src='{{imgsrc}}' alt=''></a>",
        "<div class='card-body'>",
          "<h4 class='card-title'>",
            "<a href='#'>{{name}}</a>",
          "</h4>",
          "<p class='card-text'>{{desc}}</p>",
          "<a class='btn btn-primary' href='#'>View</a>",
        "</div>",
      "</div>",
    "</div>",
  ].join("\n");
  data = {
    name: name,
    desc: desc,
    imgsrc: imgsrc,
  };
  var filler = Mustache.render(template, data);
  $("#projects-body").append(filler);
}

// use this sort of thing
var lib = storage.getAllProjects()
for (var proj in lib) {
  var projectPath = lib[proj] + '/' + proj + '.json';
	var project = loadProject(projectPath);
  // uncomment this when images working
  // var imgsrc = project.getImages()[0];
  // console.log(project.getImages());
  showProject(project.getName(), project.getDescription(), "https://upload.wikimedia.org/wikipedia/commons/d/d1/Mount_Everest_as_seen_from_Drukair2_PLW_edit.jpg");
}
showProject("HRC", "for lots of HRC things", "http://placehold.it/700x400");
