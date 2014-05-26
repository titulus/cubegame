function Cube (element_id) {
	var DOM = document.getElementById(element_id);
	this.DOM = DOM;

	var sides = ['front','top','bottom','back','left','right'];

	for (i in sides) {this[sides[i]]=['z','-y','y','-z','-x','x'][i]}

	function fill () { // fill DOM cube sides with appropriate values
		for (i in sides) {
			var element = document.getElementById(sides[i]);
			var value = this[sides[i]];
			element.innerHTML=value;
			element.style.backgroundColor = get_random_color(value);
		}
	}
	this.fill = fill;

	function rotate3d(x,y,z,degree) {
		var matrix = new WebKitCSSMatrix(DOM.style.webkitTransform);
		matrix = matrix.rotateAxisAngle(x,y,z,degree);
		DOM.style.webkitTransform = matrix.toString();
	}
	this.rotate = rotate;
	rotate(-1,-1,0,30); // initial rotation

	function make (direction) {
		var t_angles = [0,0,0];
		switch (direction) {
	        case "top" : {
	            t_angles = [1,0,0];
	            //x,-z
	        }; break;
	        case "bottom" : {
	            t_angles = [-1,0,0];
	            // x,z
	        }; break;
	        case "left" : {
	            t_angles = [0,-1,0];
	            // -z,y
	        }; break;
	        case "right" : {
	            t_angles = [0,1,0];
	            // z,y
	        }; break;
	        default: throw new TypeError('direction must be "top", "bottom", "left" or "right", but not: "'+direction+'"');
	    };

	    rotate3d(t_angles[0],t_angles[1],t_angles[2],90);
	}
	this.make = make;

	return this;
}

var cube = new Cube('cube3d') // main cube object	
cube.fill();

shortcut.add('up',function () {cube.make('top')});
shortcut.add('down',function () {cube.make('bottom')});
shortcut.add('left',function () {cube.make('left')});
shortcut.add('Right',function () {cube.make('right')});


function get_random_color (value) {
	Math.seedrandom(value);
    var color = 'rgba('+(Math.round(Math.random()*150)+55)+','+(Math.round(Math.random()*250)+5)+','+(Math.round(Math.random()*250)+5)+','+'.5)';
    Math.seedrandom();
    return color;
}