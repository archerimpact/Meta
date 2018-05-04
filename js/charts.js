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
				backgroundColor: "rgba(38, 185, 154, 0.31)",
				borderColor: "rgba(38, 185, 154, 0.7)",
				pointBorderColor: "rgba(38, 185, 154, 0.7)",
				pointBackgroundColor: "rgba(38, 185, 154, 0.7)",
				pointHoverBackgroundColor: "#fff",
				pointHoverBorderColor: "rgba(220,220,220,1)",
				pointBorderWidth: 1,
				data: values
		  }//, {
				// label: "My Second dataset",
				// backgroundColor: "rgba(3, 88, 106, 0.3)",
				// borderColor: "rgba(3, 88, 106, 0.70)",
				// pointBorderColor: "rgba(3, 88, 106, 0.70)",
				// pointBackgroundColor: "rgba(3, 88, 106, 0.70)",
				// pointHoverBackgroundColor: "#fff",
				// pointHoverBorderColor: "rgba(151,187,205,1)",
				// pointBorderWidth: 1,
				// data: [82, 23, 66, 9, 99, 4, 2]
		  //}]
    ]
		},
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
    "#455C73",
		"#9B59B6",
		"#BDC3C7",
		"#26B99A",
		"#3498DB",
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
  try {
		_map = new google.maps.Map(document.getElementById(id), {
		  zoom: 3,
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

    _map.fitBounds(bounds)
    _map.panToBounds(bounds)
	} catch (e) {}
}
