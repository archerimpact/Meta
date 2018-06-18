const Chart = require('chart.js');

/* Support no data message. */
Chart.plugins.register({
    afterDraw: function(chart) {
    if (chart.data.datasets.length === 0) {
        // No data is present
      var ctx = chart.chart.ctx;
      var width = chart.chart.width;
      var height = chart.chart.height
      chart.clear();

      ctx.save();
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.font = "16px normal 'Helvetica Nueue'";
      ctx.fillText('No data to display', width / 2, height / 2);
      ctx.restore();
    }
  }
});

var database = electron.remote.getGlobal('sharedObj').db;

function dashSearch() {
  clearSearchResults();

  var results = [];
  var searchId = $("#dashSearchId").val();
  if (searchId) {    
    database.has_project(searchId, function(bool) {
      var result;
      if (bool) {
        result = searchId;
      } else {
        result = "No Projects Found: " + searchId;
      }
      insertSearchResults(result);
      //loadDetail(searchId);
    });

    database.get_projects_with_image(searchId, function(bool, img_name, proj_names) {
      if (bool) {
        for (var index in proj_names) {
          insertSearchResults(proj_names[index]);
        };
      } else {
        insertSearchResults("No Images Found: " + searchId);
      }
    });
  } else {
    alert("Please input ____ into Search Bar");
  }
}

function insertSearchResults(results) {
  var template = [
    '<div id="" role="tablist" aria-multiselectable="true">',
      '<div class="panel panel-default data-panel">',
        '<div class="panel-body">',
          results,
        '</div>',
      '</div>',
    '</div>',
  ].join("\n");

  var filler = Mustache.render(template, results);
  $("#result-wrapper").append(filler);
}

function clearSearchResults() {
  document.getElementById("result-wrapper").innerHTML = "";
}

function create_image_timeline_chart() {
  database.get_all_image_dates(function(dates, counts) {
		addLineChart(
			"all-image-by-date",
			dates,
			"Photos Taken",
			counts
		);
  });
}

function create_image_locations_map() {
  database.get_all_image_locations(function(coordinates) {
		addMap(
			"all-image-locations",
			coordinates
		);
  });
}

function create_image_models_chart() {
  database.get_all_image_models(function(models, counts) {
		addPieChart(
			"all-image-models",
			models,
			counts,
			"Camera Make"
		);
  });
}

function create_image_apertures_chart() {
  database.get_all_image_apertures(function(apertures, counts) {
		addPieChart(
			"all-image-apertures",
			apertures,
			counts,
			"Aperture"
		);
  });
}

function clear_charts() {
  $("#all-image-by-date").html("");
  $("#all-image-locations").html("");
  $("#all-image-models").html("");
  $("#all-image-apertures").html("");
}

function populate_landing() {
  clear_charts();
  create_image_timeline_chart();
  create_image_locations_map();
  create_image_models_chart();
  create_image_apertures_chart();
}

populate_landing();