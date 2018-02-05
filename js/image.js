const electron = require('electron');
var exif = require('exiftool');
var fs = require('fs');

class Image {

  //should take in a path/src, name, and project
  constructor(name, path, project) {
      this._name = setName(name);
      this._path = setPath(path);
      this._project = setProject(project);
      this._metadata = getMetadata(path);
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

  setMetadata(metadata) {
    this._metadata = metadata;
  }

  getMetadata(path) {
    fs.readFile(path, function (err, data) {
      if (err) {
        throw err;
      } else {
        exif.metadata(data, function (err, metadata) {
          if (err) {
            throw err;
          } else {
            return metadata;
          }
        });
      }
    });
    return;
  }

}
