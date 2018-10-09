const { version } = require('./package.json');
var shell = require('electron').shell;

function clearSettings() {
  document.getElementById('fav-settings-wrapper').innerHTML = ''
  document.getElementById('csv-settings-wrapper').innerHTML = ''
}

var database = electron.remote.getGlobal('sharedObj').db;

function populate_settings_view(fields, favorite_fields, csv_fields) {

  document.getElementById('version').innerHTML = version
  $('#github_link').click(function(event) {
      event.preventDefault();
      shell.openExternal(this.href);
  });

  var favwrapper = $("#fav-settings-wrapper")
  var csvwrapper = $("#csv-settings-wrapper")
  var options = ""
  for (var ind in fields) {
    var tag = fields[ind]
    var data = {
      'tag': tag,
    }
    var fav_template = [
      '<div class="col-xs-4 col-md-3 form-check">',
        '<input class="form-check-input" type="checkbox" value="{{tag}}" id="favcheck{{tag}}">',
        '<label class="form-check-label settings-label" for="check{{tag}}">',
          tag,
        '</label>',
      '</div>',

    ].join("\n");
    var csv_template = [
      '<div style="overflow: hidden; word-" class="col-xs-4 col-md-3 form-check">',
        '<input class="form-check-input" type="checkbox" value="{{tag}}" id="csvcheck{{tag}}">',
        '<label class="form-check-label settings-label" for="check{{tag}}">',
          tag,
        '</label>',
      '</div>',
    ].join("\n");

    var fav_filler = Mustache.render(fav_template, data);
    var csv_filler = Mustache.render(csv_template, data);
    favwrapper.append(fav_filler);
    csvwrapper.append(csv_filler);

    /* Update settings when a box is checked. */
    $("#favcheck" + tag).click(function() {
      database.update_favorites_field($(this).val(), "f", $(this).is(":checked"));
    });

    $("#csvcheck" + tag).click(function() {
      database.update_favorites_field($(this).val(), "c", $(this).is(":checked"));
    });

    var template = "<option value='field'>field</option>"
    options += template.replace(/field/g, tag)
  }

  /* Check favorites. */
  for (var ind_fav in favorite_fields) {
    var fav_tag = favorite_fields[ind_fav];
    $("#favcheck" + fav_tag).prop('checked', true);
  }

  /* Check csv. */
  for (var ind_csv in csv_fields) {
    var csv_tag = csv_fields[ind_csv];
    $("#csvcheck" + csv_tag).prop('checked', true);
  }

  var favtarget = document.getElementById('select-fav')
  var csvtarget = document.getElementById('select-csv')
  favtarget.innerHTML = options
  csvtarget.innerHTML = options
  var _ = new Choices(favtarget, {
    searchPlaceholderValue: "Search to select favorites",
    itemSelectText: "",
    classNames: {containerOuter: "choices choices-fav"}
  })
  _ = new Choices(csvtarget, {
    searchPlaceholderValue: "Search to select csv fields",
    itemSelectText: "",
    classNames: {containerOuter: "choices choices-fav"}
  })
  favtarget.addEventListener('choice', selectFav)
  csvtarget.addEventListener('choice', selectcsv)

  function selectFav(event) {
    var box = $("#favcheck" + event.detail.choice.value)
    box.prop('checked', true) // !box.is(":checked")) only use the box to select, not un-select
    database.update_favorites_field(event.detail.choice.value, "f", box.is(":checked"));
  }
  function selectcsv(event) {
    var box = $("#csvcheck" + event.detail.choice.value)
    box.prop('checked', true) // !box.is(":checked")) only use the box to select, not un-select
    database.update_favorites_field(event.detail.choice.value, "c", box.is(":checked"));
  }

}

function get_favorites_helper(fields) {
  database.get_favorite_fields(function(favorite, csv) {
    populate_settings_view(fields, favorite, csv);
  });
}

function loadSettings() {
  database.get_metadata_fields(get_favorites_helper);
}

loadSettings()
