const electron = require('electron');
const _name;
const _path;
const _project;
const _metadata;

class Image {

  //should take in a path/src, name, and project
  constructor(name, path, project) {
      _name = setName(name);
      _path = setPath(path);
      _project = setProject(project);

  }

  //set path
  setPath(path) {
    _path = path;
  }

  //get path
  getPath() {
    return _path;
  }

  //set name
  setName(name) {
    _name = name;
  }

  //get name
  getName() {
    return _name;
  }

  //set project
  setProject(project) {
    _project = project;
  }

  //get project
  getProject() {
    return _project;
  }

  //need to define a variable initialized in constructor to get the metadata

  getMetadata() {
    //should call our metadata.js file
  }

  //save & load
}
