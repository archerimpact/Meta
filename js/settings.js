function loadSettings() {
  console.log("inside")
  var allTags = queryAllExifTags()
  var favwrapper = $("#fav-settings-wrapper")
  var csvwrapper = $("#csv-settings-wrapper")

  for (var ind in allTags) {
    var tag = allTags[ind]
    var data = {
      'tag': tag,
    }
    var template = [
      '<div class="col col-sm-4 col-md-3 form-check">',
        '<input class="form-check-input" type="checkbox" value="{{tag}}" id="check{{tag}}">',
        '<label class="form-check-label" for="check{{tag}}">',
          tag,
        '</label>',
      '</div>',

    ].join("\n");

    var filler = Mustache.render(template, data);
    favwrapper.append(filler);
    csvwrapper.append(filler);
  }
}

function queryAllExifTags() {
  return ['ExifTag', 'ExifTag', 'ExifTag', 'ExifTag', 'ExifTag', 'ExifTag', 'ExifTag', 'ExifTag', 'ExifTag', 'ExifTag', 'ExifTag', 'ExifTag', 'ExifTag']
}

loadSettings()
console.log("called")
