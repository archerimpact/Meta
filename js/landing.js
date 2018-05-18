const Chart = require('chart.js');

var database = electron.remote.getGlobal('sharedObj').db;

function create_image_timeline_chart() {
  database.get_all_image_dates(function(dates, counts) {
    console.log(dates);
    
    /* Set content to "no data exists" image if needed. */
		if (dates.length == 0) {

		} else {
      $("#chart-wrapper").append("<div id='timeline'></div>");
      $("#chart-wrapper").append("<p>hELP</p>");

			addLineChart(
				"timeline",
				dates,
				"Photos Taken",
				counts
			);
		}
  });
}

create_image_timeline_chart();
