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

	function make (direction) {
	    rotate(direction)
	}
	this.make = make;

	function rotate (direction) {
		var t_angles = [0,0,0];
		console.group(direction);
		switch (direction) {
	        case "top" : {
	            t_angles = convert_angles(1,0);
	        }; break;
	        case "bottom" : {
	            t_angles = convert_angles(-1,0);
	        }; break;
	        case "left" : {
	            t_angles = convert_angles(0,-1);
	        }; break;
	        case "right" : {
	            t_angles = convert_angles(0,1);
	        }; break;
	        default: throw new TypeError('direction must be "top", "bottom", "left" or "right", but not: "'+direction+'"');
	    };
		rotate3d(t_angles[0],t_angles[1],t_angles[2],90);
	}

	var coords = ['x','y','z']; // initial coord system

	function convert_angles (x,y) {
		var new_angles = [x,y,0];
		console.log(x,y);
			console.log('coords before',coords);

			

			console.log('coords after',coords);
		console.groupEnd();
		return new_angles;
	}

	function rotate3d(x,y,z,degree) {
		var matrix = new WebKitCSSMatrix(DOM.style.webkitTransform);
		matrix = matrix.rotateAxisAngle(x,y,z,degree);
		DOM.style.webkitTransform = matrix.toString();
	}
	rotate3d(-1,-1,0,30); // initial rotation

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