var database = electron.remote.getGlobal('sharedObj').db;

function populate_settings_view(fields, favorite_fields, csv_fields) {
  var favwrapper = $("#fav-settings-wrapper")
  var csvwrapper = $("#csv-settings-wrapper")

  for (var ind in fields) {
    var tag = fields[ind]
    var data = {
      'tag': tag,
    }
    var fav_template = [
      '<div class="col col-sm-4 col-md-3 form-check">',
        '<input class="form-check-input" type="checkbox" value="{{tag}}" id="favcheck{{tag}}">',
        '<label class="form-check-label" for="check{{tag}}">',
          tag,
        '</label>',
      '</div>',

    ].join("\n");
    var csv_template = [
      '<div class="col col-sm-4 col-md-3 form-check">',
        '<input class="form-check-input" type="checkbox" value="{{tag}}" id="csvcheck{{tag}}">',
        '<label class="form-check-label" for="check{{tag}}">',
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
