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
        this.getExif(path);
      } else if (helper[helper.length - 1] == "mov") {
        this._metadata = this.getMovMetadata(path)
        console.log(this._metadata);
      } else {
        var exif_data = this.getExif(path);
        var image_data = this.getImageData(path);
        var thumbnail_data = this.getThumbnailData(path);
        var gps_data = this.getGPSData(path);
        var interop_data = this.getInteropData(path);
        var maker_data = this.getMakerData(path);
        this._metadata = consolidate_metadata(image_data, thumbnail_data, exif_data, gps_data, interop_data, maker_data);
        console.log('metadata: ' + this._metadata);
      }
      this._project = project.getProjectName();

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

  getMovMetadata(path) {
  //need to figure out if we need the entire path here
    var image = fs.readFileSync(path);
  }

  //need to figure out if we need the entire path here.
  getExif(path) {
    try {
      new ExifImage({ image : path }, function (error, exifData) {
          if (error)
              console.log('Error: '+error.message);
          else {
              var data = JSON.stringify(exifData);
              var parsed = JSON.parse(data);
              console.log(parsed);
              console.log(exifData['exif']['ApertureValue']);
              var rtn = {};
              var types = ['exif', 'image', 'gps'];
              for (var ind in types) {
                var type = types[ind];
                console.log(type);
                for (var key in exifData[type]) {
                  var val = exifData[type][key];
                  console.log(val);
                  if (val.constructor.name === 'Number' || val.constructor.name ==='String') {
                    rtn[key] = val;
                  }
                }
              }
              //do something with rtn
              console.log("returning")
              console.log(rtn)
              displayInfo(rtn);
          }
      });
    } catch (error) {
        console.log('Exif Error: ' + error.message);
    }
  }
}

getInfo() {
  var dict = new Object();
  dict['name'] = this._name;
  dict['path'] = this._path;
  dict['project'] = this._project._projectName;
  dict['meta'] = this._metadata;
  return dict;
}

function displayInfo(dict) {
  for (var key in dict) {
    console.log(key.toString() + ":" + dict[key].toString() + ", ");
    // document.getElementById("wrapper").innerHTML.append(key.toString() + ":" + dict[key].toString() + ", ");
    $("#wrapper").append(key.toString() + ":" + dict[key].toString() + ", ");
  }
}

exports.Image = Image;
