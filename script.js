var cube3d = document.getElementById('cube3d');
var sides = ['front','top','bottom','back','left','right'];

var cube = {} // main cube object
	for (i in sides) {cube[sides[i]]=['z','-y','y','-z','-x','x'][i]}
