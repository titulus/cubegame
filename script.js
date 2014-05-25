function Cube (element_id) {
	var _DOM = document.getElementById(element_id);
	this.DOM = _DOM;

	var sides = ['front','top','bottom','back','left','right'];

	for (i in sides) {this[sides[i]]=['z','-y','y','-z','-x','x'][i]}

	return this;
}

var cube = new Cube('cube3d') // main cube object	