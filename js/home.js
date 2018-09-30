function slideDrawer() {
	var menu = document.getElementById('drawer-select')
	var wrapper = document.getElementById('width-mod')
	var body = document.getElementById('body')
	var wid = menu.style.width
	if (wid != '0px') {
		menu.style.width = '0px'
	} else {
		menu.style.width = '170px'
	}
}

function checkSlideDrawer() {
	if (document.getElementById('drawer-select').style.width === '170px') {
		slideDrawer()
	}
}
