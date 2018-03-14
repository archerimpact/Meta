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
      this._metadata = {};
      this._timestamp = Date.now();

      // var helper = this._path.toString().split(".");
      // if (helper[helper.length - 1] == "jpg" || helper[helper.length - 1] == "jpeg") {
      //   this.getExif(path, this._metadata, this._status);
      // } else if (helper[helper.length - 1] == "mov") {
      //   this._metadata = this.getMovMetadata(path)
      //   console.log(this._metadata);
      // } else {
      //   var exif_data = this.getExif(path, this._metadata, this._status);
      //   // var image_data = this.getImageData(path);
      //   // var thumbnail_data = this.getThumbnailData(path);
      //   // var gps_data = this.getGPSData(path);
      //   // var interop_data = this.getInteropData(path);
      //   // var maker_data = this.getMakerData(path);
      //   // this._metadata = consolidate_metadata(image_data, thumbnail_data, exif_data, gps_data, interop_data, maker_data);
      //   console.log('metadata: ' + this._metadata);
      // }
      this._project = project.getProjectName();
      // console.log(this._metadata);

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

  getMetadata() {
    return this._metadata;
  }

  // get time created
  getTimestamp() {
    return this._timestamp;
  }

  getMovMetadata(path) {
  //need to figure out if we need the entire path here
    var image = fs.readFileSync(path);
  }

  //need to figure out if we need the entire path here.
  getExif(path, dictToModify, status) {
    try {
      new ExifImage({ image : path }, function (error, exifData) {
          if (error)
              console.log('Error: '+error.message);
          else {
              var types = ['exif', 'image', 'gps'];
              for (var ind in types) {
                var type = types[ind];
                for (var key in exifData[type]) {
                  var val = exifData[type][key];
                  if (val.constructor.name === 'Number' || val.constructor.name ==='String') {
                    dictToModify[key] = val;
                  }
                }
              }
              // rtn contains a 1-level dict of all the data
              // should be reshaped to maintain the hierarchy once its working
              displayInfo(dictToModify);
              status['done'] = 1;
              // make this work!
              // setMetadata(rtn);
          }
      });
    } catch (error) {
        console.log('Exif Error: ' + error.message);
    }
  }

  getInfo() {
    var dict = new Object();
    dict['name'] = this._name;
    dict['path'] = this._path;
    dict['project'] = this._project._projectName;
    console.log('SAVING');
    console.log(this._metadata);
    dict['meta'] = this._metadata;
    dict['timestamp'] = this._timestamp;
    return dict;
  }
}

function displayInfo(dict) {
  for (var key in dict) {
    // document.getElementById("wrapper").innerHTML.append(key.toString() + ":" + dict[key].toString() + ", ");
    $("#wrapper").append(key.toString() + ":" + dict[key].toString() + ", ");
  }
}

exports.Image = Image;
