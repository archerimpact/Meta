// const exif = require('./exif.js');
const electron = require('electron');
const path = require('path');
const fs = require('fs');
const EXIF = require('exif-js');
const util = require('util');
//const audioMetaData = require('audio-metadata'); bye
const iptc = require('node-iptc');
const xmp = require('extract-iptc') //because note this one extracts both
const mp4 = require('music-metadata');
//in the future, it might be a good idea to get rid of the iptc one but for now we'll just leave things as is.



class Metadata {

  checkType(file) {

  }

  //extract exif data
  extractEXIF(file) {
    return EXIF.getData(file, function() {
      var allMetaData = EXIF.getAllTags(this);
      return JSON.stringify(allMetaData, null, "\t");
    });
  }

  //for now, leaving this out because it is for jpg files
  // //extract iptc data
  extractIPTC(file) {
    return fs.readFile(file, function(err, data) {
      if (err) { throw err }
      var iptcdata = iptc(data);
      return iptcdata;
    });
  }


  // //extract WAV (audio)
  // extractWAV(file) {
  //   var data = fs.readFileSync(file);
  //   return audioMetaData.ogg(data);
  // }

  //extract xmp/iptc
  extractXMP(file) {
    xmp.extract(file. function (error, meta) {
      if (error) {
        console.error(error);
      }
      return meta;
    });
  }


  //extract PCX
  extractPCX(file) {

  }

  //extract QuickTime
  extractQT(file) {

  }

  //extract MP4
  extractMP4(file) {
    //write this in
  }
}
