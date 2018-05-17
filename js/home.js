function slideDrawer() {
	var menu = document.getElementById('drawer-select')
	var body = document.getElementById('wrapper')
	var wid = menu.style.width
	if (wid != '0px') {
		menu.style.width = '0px'
		body.style.marginLeft = '0px'
		// wid = document.getElementById('side-nav').offsetWidth
		// var newWidth = body.offsetWidth + wid
		// body.style.width = newWidth.toString() + 'px'
	} else {
		menu.style.width = "16.666%"
		wid = document.getElementById('side-nav').offsetWidth
		body.style.marginLeft = wid.toString() + 'px'
		// var newWidth = body.offsetWidth - wid
		// body.style.width = newWidth.toString() + 'px'
	}
}
