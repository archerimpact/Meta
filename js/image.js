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
        var exif_data = this.getExif(path);
        var image_data = this.getImageData(path);
        var thumbnail_data = this.getThumbnailData(path);
        var gps_data = this.getGPSData(path);
        var interop_data = this.getInteropData(path);
        var maker_data = this.getMakerData(path);
        this._metadata = this.consolidate_metadata(image_data, thumbnail_data, exif_data, gps_data, interop_data, maker_data);
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
  getExif(path) {
    try {
      var img = new ExifImage({ image : path }, function (error, exifData) {
          if (error)
              console.log('Error: '+error.message);
          else {
              var exif = exifData['exif'];
              return exif;
          }
      });
      console.log(img.exifData.exif);
      return img.exifData.exif;
    } catch (error) {
        console.log('Error: ' + error.message);
    }
  }

  getImageData(path) {
    try {
      var img = new ExifImage({ image : path }, function (error, exifData) {
          if (error)
              console.log('Error: '+error.message);
          else {
              var exif = exifData['image'];
              return exif;
          }
      });
      console.log(img.exifData.image);
      return img.exifData.image;
    } catch (error) {
        console.log('Error: ' + error.message);
    }
  }

  getThumbnailData(path) {
    try {
      var img = new ExifImage({ image : path }, function (error, exifData) {
          if (error)
              console.log('Error: '+error.message);
          else {
              var exif = exifData['exif'];
              return exif;
          }
      });
      console.log(img.exifData.thumbnail);
      return img.exifData.thumbnail;
    } catch (error) {
        console.log('Error: ' + error.message);
    }
  }

  getGPSData(path) {
    try {
      var img = new ExifImage({ image : path }, function (error, exifData) {
          if (error)
              console.log('Error: '+error.message);
          else {
              var exif = exifData['exif'];
              return exif;
          }
      });
      console.log(img.exifData.gps);
      return img.exifData.gps;
    } catch (error) {
        console.log('Error: ' + error.message);
    }
  }

  getInteropData(path) {
    try {
      var img = new ExifImage({ image : path }, function (error, exifData) {
          if (error)
              console.log('Error: '+error.message);
          else {
              var exif = exifData['exif'];
              return exif;
          }
      });
      console.log(img.exifData.interoperability);
      return img.exifData.interoperability;
    } catch (error) {
        console.log('Error: ' + error.message);
    }
  }

  getMakerData(path) {
    try {
      var img = new ExifImage({ image : path }, function (error, exifData) {
          if (error)
              console.log('Error: '+error.message);
          else {
              var exif = exifData['exif'];
              return exif;
          }
      });
      console.log(img.exifData.makernote);
      return img.exifData.makernote;
    } catch (error) {
        console.log('Error: ' + error.message);
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

  consolidate_metadata(image_data, thumbnail_data, exif_data, gps_data, interop_data, maker_data) {
    var return_value = new Object();

    var image_attributes = ['InteropIndex', 'InteropVersion', 'ProcessingSoftware', 'SubfileType', 'OldSubfileType', 'ImageWidth', 'ImageHeight', 'BitsPerSample', 'Compression', 'PhotometricInterpretation', 'Thresholding', 'CellWidth', 'CellLength', 'FillOrder', 'DocumentName', 'ImageDescription', 'Make', 'Model', 'StripOffsets', 'Orientation', 'SamplesPerPixel',
  'RowsPerStrip', 'StripByteCounts', 'MinSampleValue', 'MaxSampleValue', 'XResolution', 'YResolution', 'PlanarConfiguration', 'PageName', 'XPosition', 'YPosition', 'FreeOffsets', 'FreeByteCounts', 'GrayResponseUnit', 'GrayResponseCurve', 'T4Options', 'T6Options', 'ResolutionUnit', 'PageNumber', 'ColorResponseUnit', 'TransferFunction', 'Software', 'ModifyDate',
  'Artist', 'HostComputer', 'Predictor', 'WhitePoint', 'PrimaryChromaticities', 'ColorMap', 'HalftoneHints', 'TileWidth', 'TileLength', 'TileOffsets', 'TileByteCounts', 'BadFaxLines', 'CleanFaxData', 'ConsecutiveBadFaxLines', 'SubIFD', 'InkSet', 'InkNames', 'NumberofInks', 'DotRange', 'TargetPrinter', 'ExtraSamples', 'SampleFormat', 'SMinSampleValue',
  'SMaxSampleValue', 'TransferRange', 'ClipPath', 'XClipPathUnits', 'YClipPathUnits', 'Indexed', 'JPEGTables', 'OPIProxy', 'GlobalParametersIFD', 'ProfileType', 'FaxProfile', 'CodingMethods', 'VersionYear', 'ModeNumber', 'Decode', 'DefaultImageColor', 'T82Options', 'JPEGTables', 'JPEGProc', 'ThumbnailOffset', 'ThumbnailLength', 'JPEGRestartInterval',
  'JPEGRestartInterval', 'JPEGLosslessPredictors', 'JPEGPointTransforms', 'JPEGQTables', 'JPEGDCTables', 'JPEGACTables', 'YCbCrCoefficients', 'YCbCrSubSampling', 'YCbCrPositioning', 'ReferenceBlackWhite', 'StripRowCounts', 'ApplicationNotes', 'USPTOMiscellaneous', 'RelatedImageFileFormat', 'RelatedImageWidth', 'RelatedImageHeight', 'Rating',
  'XP_DIP_XML', 'StitchInfo', 'RatingPercent', 'ImageID', 'WangTag1', 'WangAnnotation', 'WangTag3', 'WangTag4', 'Matteing', 'DataType', 'ImageDepth', 'TileDepth', 'Model2', 'CFARepeatPatternDim', 'CFAPattern2', 'BatteryLevel', 'KodakIFD', 'Copyright', 'ExposureTime', 'FNumber', 'MDFileTag', 'MDScalePixel', 'MDColorTable', 'MDLabName',
  'MDSampleInfo', 'MDPrepDate', 'MDPrepTime', 'MDFileUnits', 'PixelScale', 'AdventScale', 'AdventRevision', 'UIC1Tag', 'UIC2Tag', 'UIC3Tag', 'UIC4Tag', 'IPTC-NAA', 'IntergraphPacketData', 'IntergraphFlagRegisters', 'IntergraphMatrix', 'INGRReserved', 'ModelTiePoint', 'Site', 'ColorSequence', 'IT8Header', 'RasterPadding', 'BitsPerRunLength',
  'BitsPerExtendedRunLength', 'ColorTable', 'ImageColorIndicator', 'BackgroundColorIndicator', 'ImageColorValue', 'BackgroundColorValue', 'PixelIntensityRange', 'TransparencyIndicator', 'ColorCharacterization', 'HCUsage', 'TrapIndicator', 'CMYKEquivalent', 'SEMInfo', 'AFCP_IPTC', 'PixelMagicJBIGOptions', 'ModelTransform', 'WB_GRGBLevels', 'LeafData', 'PhotoshopSettings', 'ExifOffset', 'ICC_Profile',
  'TIFF_FXExtensions', 'MultiProfiles', 'SharedData', 'T88Options', 'ImageLayer', 'GeoTiffDirectory', 'GeoTiffDoubleParams', 'GeoTiffAsciiParams', 'ExposureProgram', 'SpectralSensitivity', 'GPSInfo', 'ISO', 'Opto-ElectricConvFactor', 'Interlace', 'TimeZoneOffset', 'SelfTimerMode', 'SensitivityType', 'StandardOutputSensitivity', 'RecommendedExposureIndex', 'ISOSpeed', 'ISOSpeedLatitudeyyy', 'ISOSpeedLatitudezzz',
  'FaxRecvParams', 'FaxSubAddress', 'FaxRecvTime', 'LeafSubIFD', 'ExifVersion', 'DateTimeOriginal', 'CreateDate', 'ComponentsConfiguration', 'CompressedBitsPerPixel', 'ShutterSpeedValue', 'ApertureValue', 'BrightnessValue', 'ExposureCompensation', 'MaxApertureValue', 'SubjectDistance', 'MeteringMode', 'LightSource', 'Flash', 'FocalLength', 'FlashEnergy', 'SpatialFrequencyResponse', 'Noise',
  'FocalPlaneXResolution', 'FocalPlaneYResolution', 'FocalPlaneResolutionUnit', 'ImageNumber', 'SecurityClassification', 'ImageHistory', 'SubjectArea', 'ExposureIndex', 'TIFF-EPStandardID', 'SensingMethod', 'CIP3DataFile', 'CIP3Sheet', 'CIP3Side', 'StoNits', 'MakerNote', 'UserComment', 'SubSecTime', 'SubSecTimeOriginal', 'SubSecTimeDigitized',
  'MSDocumentText', 'MSPropertySetStorage', 'MSDocumentTextPosition', 'ImageSourceData', 'XPTitle', 'XPComment', 'XPAuthor', 'XPKeywords', 'XPSubject', 'FlashpixVersion', 'ColorSpace', 'ExifImageWidth', 'ExifImageHeight', 'RelatedSoundFile', 'InteropOffset', 'FlashEnergy', 'SpatialFrequencyResponse', 'Noise', 'FocalPlaneXResolution', 'FocalPlaneYResolution', 'FocalPlaneResolutionUnit', 'ImageNumber',
  'SecurityClassification', 'ImageHistory', 'SubjectLocation', 'ExposureIndex', 'TIFF-EPStandardID', 'SensingMethod', 'FileSource', 'SceneType', 'CFAPattern', 'CustomRendered', 'ExposureMode', 'WhiteBalance', 'DigitalZoomRatio', 'FocalLengthIn35mmFormat', 'SceneCaptureType', 'GainControl', 'Contrast', 'Saturation', 'Sharpness', 'DeviceSettingDescription', 'SubjectDistanceRange', 'ImageUniqueID',
  'OwnerName', 'SerialNumber', 'LensInfo', 'LensMake', 'LensModel', 'LensSerialNumber', 'GDALMetadata', 'GDALNoData', 'Gamma', 'ExpandSoftware', 'ExpandLens', 'ExpandFilm', 'ExpandFilterLens', 'ExpandScanner', 'ExpandFlashLamp', 'PixelFormat', 'Transformation', 'Uncompressed', 'ImageType', 'ImageWidth', 'ImageHeight',
  'WidthResolution', 'HeightResolution', 'ImageOffset', 'ImageByteCount', 'AlphaOffset', 'AlphaByteCount', 'ImageDataDiscard', 'AlphaDataDiscard', 'OceScanjobDesc', 'OceApplicationSelector', 'OceIDNumber', 'OceImageLogic', 'Annotations', 'PrintIM', 'USPTOOriginalContentType', 'DNGVersion', 'DNGBackwardVersion', 'UniqueCameraModel', 'LocalizedCameraModel', 'CFAPlaneColor', 'CFALayout', 'LinearizationTable',
  'BlackLevelRepeatDim', 'BlackLevel', 'BlackLevelDeltaH', 'BlackLevelDeltaV', 'WhiteLevel', 'DefaultScale', 'DefaultCropOrigin', 'DefaultCropSize', 'ColorMatrix1', 'ColorMatrix2', 'CameraCalibration1', 'CameraCalibration2', 'ReductionMatrix1', 'ReductionMatrix2', 'AnalogBalance', 'AsShotNeutral', 'AsShotWhiteXY', 'BaselineExposure',
  'BaselineNoise', 'BaselineSharpness', 'BayerGreenSplit', 'LinearResponseLimit', 'CameraSerialNumber', 'DNGLensInfo', 'ChromaBlurRadius', 'AntiAliasStrength', 'ShadowScale', 'DNGPrivateData', 'MakerNoteSafety', 'RawImageSegmentation', 'CalibrationIlluminant1', 'CalibrationIlluminant2', 'BestQualityScale', 'RawDataUniqueID', 'AliasLayerMetadata', 'OriginalRawFileName', 'OriginalRawFileData', 'ActiveArea', 'MaskedAreas',
  'AsShotICCProfile', 'AsShotPreProfileMatrix', 'CurrentICCProfile', 'CurrentPreProfileMatrix', 'ColorimetricReference', 'PanasonicTitle', 'PanasonicTitle2', 'CameraCalibrationSig', 'ProfileCalibrationSig', 'ProfileIFD', 'AsShotProfileName', 'NoiseReductionApplied', 'ProfileName', 'ProfileHueSatMapDims', 'ProfileHueSatMapData1', 'ProfileHueSatMapData2', 'ProfileToneCurve', 'ProfileEmbedPolicy', 'ProfileCopyright', 'ForwardMatrix1', 'ForwardMatrix2',
  'PreviewApplicationName', 'PreviewApplicationVersion', 'PreviewSettingsName', 'PreviewSettingsDigest', 'PreviewColorSpace', 'PreviewDateTime', 'RawImageDigest', 'OriginalRawFileDigest', 'SubTileBlockSize', 'RowInterleaveFactor', 'ProfileLookTableDims', 'ProfileLookTableDims', 'OpcodeList1', 'OpcodeList2', 'OpcodeList3', 'NoiseProfile', 'TimeCodes', 'FrameRate', 'TStop', 'ReelName', 'OriginalDefaultFinalSize', 'OriginalBestQualitySize',
  'OriginalDefaultCropSize', 'CameraLabel', 'ProfileHueSatMapEncoding', 'ProfileLookTableEncoding', 'BaselineExposureOffset', 'DefaultBlackRender', 'NewRawImageDigest', 'RawToPreviewGain', 'DefaultUserCrop', 'Padding', 'OffsetSchema', 'OwnerName', 'SerialNumber', 'Lens', 'KDC_IFD', 'RawFile', 'Converter', 'WhiteBalance', 'Exposure', 'Shadows', 'Brightness', 'Contrast',
  'Saturation', 'Sharpness', 'Smoothness', 'MoireFilter'];

  var geo_attributes = ['GPSVersionID', 'GPSLatitudeRef', 'GPSLatitude', 'GPSLongitudeRef', 'GPSLongitude', 'GPSAltitudeRef', 'GPSAltitude', 'GPSTimeStamp', 'GPSSatellites', 'GPSStatus', 'GPSMeasureMode', 'GPSDOP', 'GPSSpeedRef', 'GPSSpeed', 'GPSTrackRef', 'GPSTrack', 'GPSImgDirectionRef', 'GPSImgDirection', 'GPSMapDatum', 'GPSDestLatitudeRef',
  'GPSDestLatitude', 'GPSDestLongitudeRef', 'GPSDestLongitude', 'GPSDestBearingRef', 'GPSDestBearing', 'GPSDestDistanceRef', 'GPSDestDistance', 'GPSProcessingMethod', 'GPSAreaInformation', 'GPSDateStamp', 'GPSDifferential', 'GPSHPositioningError'];
  console.log("TEST");
  console.log(image_data);
  console.log(image_data['Make']);
  image_data = image_data;
  console.log(image_data['Make']);
    for (var img_attr in image_attributes) {
      if (image_data[img_attr] != null) {
        return_value[img_attr] = image_data[img_attr];
      } else {
        return_value[img_attr] = undefined;
      }
    }

    for (var geo_attr in geo_attributes) {
      if (gps_data[geo_attr] != null) {
        return_value[geo_attr] = gps_data[geo_attr];
      } else {
        return_value[geo_attr] = undefined;
      }
    }
    console.log("return value");
    console.log(return_value);
    return return_value;
  }

}


exports.Image = Image;
