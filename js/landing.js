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
      if (bool) {
        database.get_project_thumbnail(searchId, function(path) {
          var results = {};
          results.path = path;
          results.proj_name = searchId;
          insertSearchResults(false, results);
        });
      } else {
        insertSearchResults(true, "No Projects Found: " + searchId);
      }
      //loadDetail(searchId);
    });

    database.get_projects_with_image(searchId, function(bool, img_name, projects) {
      if (bool) {
        for (var index in projects) {
          insertSearchResults(false, projects[index]);
        };
      } else {
        insertSearchResults(true, "No Images Found: " + searchId);
      }
    });
  } else {
    alert("Please input ____ into Search Bar");
  }
}

function insertSearchResults(error, results) {
  if (error) {
    var template = [
      '<div id="" role="tablist" aria-multiselectable="true">',
        '<div class="panel panel-default data-panel">',
          '<div class="panel-body">',
            results,
          '</div>',
        '</div>',
      '</div>',
    ].join("\n");
  } else {
    var template = [
      "<div class='col-lg-4 col-xs-6 portfolio-item'>",
        "<div class='card h-100'>",
          "<a id='photo-{{proj_name}}' href='#'><img style='width: 100%; height: 15vw; object-fit: cover' class='card-img-top img-responsive' src='{{path}}' alt=''></a>",
          "<div class='card-block well' style='border-radius: 0px'>",
            "<h4 class='card-title'>",
              "<a style='padding: 0px; margin: -10px; color: #3d3d3d' id='link-{{proj_name}}' href='#'>{{proj_name}}</a>",
            "</h4>",
            "<a class='btn btn-primary' style='background-color: #0d77e2; color: white' id='btn-{{proj_name}}' href='#'>View</a>",
          "</div>",
        "</div>",
      "</div>",
    ].join("\n");
    // data = {
    //   displayName: results.proj_name,
    //   name: results.proj_name,
    //   imgsrc: results.path,
    // };
  }

  var filler = Mustache.render(template, results);
  $("#result-wrapper").append(filler);

  document.getElementById('link-' + results.proj_name).onclick = function() {
    loadDetail(results.proj_name);
  };
  document.getElementById('btn-' + results.proj_name).onclick = function() {
    loadDetail(results.proj_name);
  };
  document.getElementById('photo-' + results.proj_name).onclick = function() {
    loadDetail(results.proj_name);
  };
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

function create_data_charts() {
  database.get_metadata_fields(charts_helper)
}

function charts_helper(fields) {
  var options = ""
  var template = "<option value='field'>field</option>"
  for (var ind in fields) {
    var field = fields[ind]
    options += template.replace(/field/g, field)
  }
  var data1 = document.getElementById('field-select-1')
  var data2 = document.getElementById('field-select-2')
  data1.innerHTML = "<option selected hidden disabled>Camera Make</option>" + options
  data2.innerHTML = "<option selected hidden disabled>Aperture</option>" + options

  var _ = new Choices(data1, {
    searchPlaceholderValue: "Type to search",
  })
  _ = new Choices(data2, {
    searchPlaceholderValue: "Type to search"
  })

  function selectorFunction(event) {
    database.get_data_by_field(event.detail.choice.value, function(labels, counts) {
      if (event.path[0].id === 'field-select-1') {
        var target = 'chart-1'
        document.getElementById('chart1-parent').innerHTML = "<canvas id='chart-1'></canvas>"
      } else {
        var target = 'chart-2'
        document.getElementById('chart2-parent').innerHTML = "<canvas id='chart-2'></canvas>"
      }
      addPieChart(
        target,
        labels,
        counts,
        event.detail.choice.value,
      )
    })
  }

  data1.addEventListener('choice', selectorFunction)
  data2.addEventListener('choice', selectorFunction)
}

function create_image_models_chart() {
  database.get_all_image_models(function(models, counts) {
		addPieChart(
			"chart-1",
			models,
			counts,
			"Camera Make"
		);
  });
}

function create_image_apertures_chart() {
  database.get_all_image_apertures(function(apertures, counts) {
		addPieChart(
			"chart-2",
			apertures,
			counts,
			"Aperture"
		);
  });
}

function clear_charts() {
  $("#all-image-by-date").html("");
  $("#all-image-locations").html("");
  $("#chart-1").html("");
  $("#chart-2").html("");
}

function populate_landing() {
  clear_charts();
  create_image_timeline_chart();
  create_image_locations_map();
  create_image_models_chart();
  create_image_apertures_chart();
  create_data_charts();
}

populate_landing();
