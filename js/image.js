const electron = require('electron');
const exif_mov = require('exiftool');
const fs = require('fs');
const exif_jpg = require('exif-js');

class Image {

  //should take in a path/src, name, and project
  constructor(name, path, project) {
      this._name = name;
      this._path = path;
      this._project = project;

      var helper = null;
      if (this._path && typeof this._path === 'string') {
        helper = this._path.split('.');
      }
      if (helper && (helper[helper.length - 1] == "jpg" || helper[helper.length - 1] == "jpeg")) {
        this._metadata = getJpgMetdata(path);
      } else if (helper && helper[helper.length - 1] == "mov") {
        this._metadata = getMovMetadata(path)
      } else {
        this._metadata = null;
      }

  }

  //set path
  setPath(path) {
    this._path = path;
  }

  //get path
  getPath() {
    return this._path;
  }

  //set name
  setName(name) {
    this._name = name;
  }

  //get name
  getName() {
    return this._name;
  }

  //set project
  setProject(project) {
    this._project = project;
  }

  //get project
  getProject() {
    return this._project;
  }

  setMetadata(metadata) {
    this._metadata = metadata;
  }

  getMovMetadata(path) {
  //need to figure out if we need the entire path here
    var image = fs.readFileSync(path);
  }

  //need to figure out if we need the entire path here.
  getJpgMetdata(path) {
    return exif_jpg.getData(path, function() {
      var allMetaData = exif_jpg.getAllTags(this);
      return allMetaData;
    });
  }

}
exports.Image = Image;
