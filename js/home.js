function slideDrawer() {
	var menu = document.getElementById('drawer-select')
	var wrapper = document.getElementById('width-mod')
	var body = document.getElementById('body')
	var wid = menu.style.width
	if (wid != '0px') {
		menu.style.width = '0px'
		//wrapper.style.marginLeft = '15px'
		// wid = document.getElementById('side-nav').offsetWidth
		// var newWidth = body.offsetWidth + wid
		// body.style.width = newWidth.toString() + 'px'
	} else {
		menu.style.width = "16.666%"
		//wid = document.getElementById('side-nav').offsetWidth + 15
		//wrapper.style.marginLeft = wid.toString() + 'px'
		// body.style.width = "83.333%"
		// body.style.marginLeft =  wid.toString() + 'px'
		//body.style.width = "66.666%"
		// var newWidth = body.offsetWidth - wid
		// body.style.width = newWidth.toString() + 'px'
	}
}

function checkSlideDrawer() {
	if (document.getElementById('drawer-select').style.width === '16.666%') {
		slideDrawer()
	}
}
