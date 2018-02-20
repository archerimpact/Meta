const electron = require('electron');
const exif_mov = require('exiftool');
const fs = require('fs');
const exif_jpg = require('exif-js');
const ExifImage = require('exif').ExifImage;

class Image {

  //should take in a path/src, name, and project
  constructor(name, path, project) {
      this._name = name;
      this._path = path;
      this._project = project;

      var helper = this._path.toString().split(".");
      if (helper[helper.length - 1] == "jpg" || helper[helper.length - 1] == "jpeg") {
        this._metadata = this.getJpgMetdata(path);
        console.log(this._metadata);
      } else if (helper[helper.length - 1] == "mov") {
        this._metadata = this.getMovMetadata(path)
        console.log(this._metadata);
      } else {
        this._metadata = this.getJpgMetdata(path);
        console.log('metadata: ' + this._metadata);
      }

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

  getMovMetadata(path) {
  //need to figure out if we need the entire path here
    var image = fs.readFileSync(path);
  }

  //need to figure out if we need the entire path here.
  getJpgMetdata(path) {
    console.log("path in jpg meta");
    console.log(path);
    try {
      var img = new ExifImage({ image : path }, function (error, exifData) {
          if (error)
              console.log('Error: '+error.message);
          else {
              console.log(exifData['exif']); // Do something with your data!
              var exif = exifData['exif'];
              console.log(exif);
              return exif;
          }
      });
      return img.exifData.exif;
    } catch (error) {
        console.log('Error: ' + error.message);
    }

    // return exif_jpg.getAllTags(this);
    // exif_jpg.EXIF.getData(path, function() {
    //   var allMetaData = exif_jpg.getAllTags(this);
    //   console.log("metadata");
    //   console.log(allMetaData);
    //   return allMetaData;
    // });
    // return exif_jpg.EXIF.findEXIFinJPEG(path);
  }

  getInfo() {
    var dict = new Object();
    dict['name'] = this._name;
    dict['path'] = this._path;
    dict['project'] = this._project._projectName;
    dict['meta'] = this._metadata;
    return dict;
  }

}


exports.Image = Image;
