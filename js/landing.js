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

function create_image_timeline_chart() {
  database.get_all_image_dates(function(dates, counts) {
    console.log(dates);

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
    console.log(coordinates);
    console.log(coordinates instanceof Array);

		addMap(
			"all-image-locations",
			coordinates
		);
  });
}

function create_image_models_chart() {
  database.get_all_image_models(function(models, counts) {
    console.log(models);

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
    console.log(apertures);

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
  console.log("invoked");
  clear_charts();
  create_image_timeline_chart();
  create_image_locations_map();
  create_image_models_chart();
  create_image_apertures_chart();
}
