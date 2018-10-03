function nospaces(str) {
  return str.replace(/ /g, "…");
}

function withspaces(str) {
  return str.replace(/…/g, " ");
}

// Note that this only works for javascript dates, as the exiftool
// 1-indexes its dates
var months = {
  0: 'Jan',
  1: 'Feb',
  2: 'Mar',
  3: 'Apr',
  4: 'May',
  5: 'Jun',
  6: 'Jul',
  7: 'Aug',
  8: 'Sep',
  9: 'Oct',
  10: 'Nov',
  11: 'Dec',
}

function pad(num) {
  return ('0' + num).slice(-2)
}

function displayDate(jsondate) {
  var day = jsondate.day + ' ' + months[jsondate.month - 1] + ' ' + jsondate.year
  var time = ' at ' + jsondate.hour + ':' + pad(jsondate.minute) + ':' + pad(jsondate.second)
  var hrdiff = jsondate.tzoffsetMinutes/60
  if (hrdiff > 0) {
    hrdiff = '+' + hrdiff
  } else if (hrdiff == 0) {
    hrdiff = ''
  }
  var zone = ', GMT' + hrdiff
  return day + time + zone
}

function yearStr(date) {
  return date.getFullYear()
}
function monthStr(date) {
  return months[date.getMonth()] + ' ' + yearStr(date)
}
function dayStr(date) {
  return date.getDate() + ' ' + monthStr(date)
}
function hourStr(date) {
  return dayStr(date) + date.getHours()
}
function minStr(date) {
  return hourStr(date) + ':' + pad(date.getMinutes())
}
function secStr(date) {
  return minStr(date) + ':' + pad(date.getSeconds())
}
