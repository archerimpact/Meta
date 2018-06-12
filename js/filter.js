const clearDetailsHtml = require('./js/detail.js').clearDetailsHtml;

var rows_showing = 1;

// any changes here must be reflected in index.html as well,
// where the first filter is instantiated
var filter_template = [
  '<div class="row" id="filter{{num}}">',
    '<div class="col-xs-6" style="padding-right:5px; padding-left:20px;">',
      '<input id="filter-field-{{num}}" type="text" class="form-control" placeholder="Field">',
    '</div>',
    '<div class="col-xs-6" style="padding-left:0px; padding-right:20px;">',
      '<input id="filter-value-{{num}}" type="text" class="form-control" placeholder="Value">',
    '</div>',
  '</div>',
].join('\n')

function addFilterRow() {
  var filter = Mustache.render(filter_template, {num: rows_showing + 1})
  $('#filters').append(filter)
  rows_showing += 1;

}

function removeFilterRow() {
  console.log(rows_showing)
  if (rows_showing == 0) {
    return;
  }
  var last_filter = document.getElementById('filter' + rows_showing.toString())
  last_filter.parentNode.removeChild(last_filter);
  rows_showing = Math.max(0, rows_showing - 1)
}

function performFilter() {
  var projName = document.getElementById('project-name').innerHTML;
  filters = {}
  for (var i = 1; i <= rows_showing; i++) {
    var fieldID = "#filter-field-" + i.toString()
    var valID = "#filter-value-" + i.toString()
    var field = $(fieldID).val()
    var val = $(valID).val()
    if (field && val) {
      if (field == 'tag') field = 'tags';
      if (field == 'note') field = 'notes';
      filters[field] = val;
    }
  }
  loadDetail(projName, filters)
}
