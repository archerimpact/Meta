// id is the id of the div the chart will be added to (without the #)
// xlabels is array of time points (e.g. [2000, 2001, 2001, ....])
// ylabel is the name of the data (e.g. picture count)
// values is array of values (e.g. [1,2,3...])
function addLineChart(id, xlabels, ylabel, values) {
  if (!$('#' + id).length){
    return;
  }

  var elem = document.getElementById(id);

  var lineChart = new Chart(elem, {
		type: 'line',
		data: {
		  labels: xlabels,
		  datasets: [{
				label: ylabel,
				backgroundColor: "#fd82cc",
				borderColor: "#ff0099",
				pointBorderColor: "#ff0099",
				pointBackgroundColor: "#ff0099",
				pointHoverBackgroundColor: "#fd82cc",
				pointHoverBorderColor: "#ff0099",
				pointBorderWidth: 1,
				data: values
		  }
    ]},
    options: {
      responsive: true,
      animation: {
        animateScale: true
      },
      scales: {
        yAxes: [{
          ticks: {
            beginAtZero: true,
            callback: function (value) { if (Number.isInteger(value)) { return value; } },
            stepSize: 1
          }
        }]
      }
    }
  });
}

// id is the id of the div into which the chart will be added
// labels are the category names
// values should be in same order as labels, not normalized
function addPieChart(id, labels, values, title) {
  if (!($('#' + id).length)) {
    return;
  }
  var elem = document.getElementById(id);
  var len = values.length
  // 5 repeating colors, up to 40 total categories
  var colors = [
    "#f8e408",
		"#afec84",
		"#4baffd",
		"#fbc0e3",
		"#f8ef90",
  ]
  colors = colors.concat(colors)
  colors = colors.concat(colors)
  colors = colors.concat(colors)
  var neededColors = colors.slice(0, len)

  var data = {
  	datasets: [{
  	  data: values,
  	  backgroundColor: neededColors,
  	  label: name // for legend, if wanted
  	}],
  	labels: labels,
  };

  var pieChart = new Chart(elem, {
  	data: data,
  	type: 'pie',
  	options: {
  	  legend: false,
      title: {
        display: true,
        text: title,
      }
  	}
    });
}

// id is id of div into which map will go
// markers is array of lat/lng objects, e.g. [{lat: x, lng:y}, ...]
function addMap(id, markers) {

  var elem = document.getElementById(id)

  if (!markers || markers.length == 0) {
    elem.innerHTML = "Sorry, no images in this project have location info."
  } else {
    elem.innerHTML = "<button class='btn btn-default btn-circle btn-xl' style='margin-top: calc(25% - 10px);' data-markers='" + JSON.stringify(markers) +"'>Load Map</button>"
    elem.onclick = actuallyAddMap
  }
}

function actuallyAddMap(event) {
  var idElem = event.path[1]
  try {
    if (!idElem) {
      return
    }
    var markers = JSON.parse(event.srcElement.dataset.markers)
		_map = new google.maps.Map(idElem, {
		  zoom: 6,
		  center: {'lat': 0, 'lng': 0},
		});

    bounds  = new google.maps.LatLngBounds();
    for (var ind in markers) {
  		var marker = new google.maps.Marker({
  	    position: markers[ind],
  	    map: _map,
  	  });
      loc = new google.maps.LatLng(marker.position.lat(), marker.position.lng());
      bounds.extend(loc);
    }

    _map.fitBounds(bounds);
    _map.panToBounds(bounds);
	} catch (e) {
    console.error("Failing map: " + e);
  }
}

// leave project name as empty string for landing page chart
function renderLineChart(proj_name, filter_params) {
  if (proj_name == '') {
    //do landing page chart here
    database.get_all_image_dates(function(dates, counts) {
      if (dates.length == 0) {

      } else {
        var data = processDates(
          dates,
          counts,
          document.getElementById('gmt-landing').checked,
          document.getElementById('granularity-landing').value,
        )
        var chart_dates = data.dates
        var chart_counts = data.counts

        addLineChart(
          "all-image-by-date",
          chart_dates,
          "Photos Taken",
          chart_counts,
        )
      }
    }
  )
  } else {
    database.get_images_by_date(proj_name, function(dates, counts) {
      /* Set content to "no data exists" image if needed. */
      if (dates.length == 0) {

      } else {
        var data = processDates(
          dates,
          counts,
          document.getElementById('gmt-detail').checked,
          document.getElementById('granularity-detail').value
        )
        var chart_dates = data.dates
        var chart_counts = data.counts

      	addLineChart(
      		"lineChart",
      		chart_dates,
      		"Photos Taken",
      		chart_counts
      	);
      }
    },
    filter_params,
    );
  }
}

function processDates(old_dates, old_counts, gmt, granularity) {
  for (i in old_dates) {
    var obj = JSON.parse(old_dates[i])
    var min = obj.minute
    if (gmt) {
      min = obj.minute - obj.tzoffsetMinutes
    }
    old_dates[i] = new Date(obj.year, obj.month - 1, obj.day, obj.hour, min, obj.second, obj.millis)
  }
  old_dates.sort(function(a,b) {return a - b;})

  var new_dates = []
  var new_counts = []
  var new_date
  for (i in old_dates) {
    var date = old_dates[i]
    if (granularity === 'Year') {
      new_date = yearStr(date)
    } else if (granularity === 'Month') {
      new_date = monthStr(date)
    } else if (granularity === 'Day') {
      new_date = dayStr(date)
    } else if (granularity === 'Hour') {
      new_date = hourStr(date)
    } else if (granularity === 'Minute') {
      new_date = minStr(date)
    } else {
      new_date = secStr(date)
    }

    if (new_dates.indexOf(new_date) >= 0) {
      new_counts[new_dates.indexOf(new_date)] += 1;
    } else {
      new_dates.push(new_date)
      new_counts.push(old_counts[i])
    }
  }
  console.log(new_dates)
  console.log(new_counts)
  return {'dates': new_dates, 'counts': new_counts}
}
