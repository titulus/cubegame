function Cube (element_id) {
	var DOM = document.getElementById(element_id);
	this.DOM = DOM;

	var axis = ['z','-y','y','-z','-x','x'];
	var side = {};
	var coords = ['x','y','z']; // initial coord system

	for (i in axis) {side[axis[i]]=axis[i]}

	function fill () { // fill DOM cube sides with appropriate values
		for (i in axis) {
			var element = document.getElementById('side_'+axis[i]);
			var value = side[axis[i]];
			element.childNodes[0].innerHTML=value;
			element.style.backgroundColor = get_random_color(value);
		}
	}

	function make (direction) {
	    rotate(direction)
	}
	this.make = make;

	function rotate (direction) {
		var t_angles = [0,0,0];
		console.group(direction);
		switch (direction) {
	        case "up" : {
	            t_angles = convert_angles(1,0);
	        }; break;
	        case "down" : {
	            t_angles = convert_angles(-1,0);
	        }; break;
	        case "left" : {
	            t_angles = convert_angles(0,-1);
	        }; break;
	        case "right" : {
	            t_angles = convert_angles(0,1);
	        }; break;
	        default: throw new TypeError('direction must be "up", "down", "left" or "right", but not: "'+direction+'"');
	    };
		rotate3d(t_angles[0],t_angles[1],t_angles[2],90);
	}


	function convert_angles (x,y) {
		var new_angles = [0,0,0];
		
		console.log(x,y);
			console.log('coords before',coords);

			switch (coords[0]) {
				case "x" : new_angles[0]=x;break;
				case "-x" : new_angles[0]=-x;break;
				case "y" : new_angles[1]=x;break;
				case "-y" : new_angles[1]=-x;break;
				case "z" : new_angles[2]=x;break;
				case "-z" : new_angles[2]=-x;break;
			}
			switch (coords[1]) {
				case "x" : new_angles[0]=y;break;
				case "-x" : new_angles[0]=-y;break;
				case "y" : new_angles[1]=y;break;
				case "-y" : new_angles[1]=-y;break;
				case "z" : new_angles[2]=y;break;
				case "-z" : new_angles[2]=-y;break;
			}

			switch ([x,y].join(',')) {
				case "1,0": { //up
					var temp = coords[2];
					coords[2] = coords[1];
					coords[1] = (temp.length==1)?'-'+temp:temp[1];
				}; break;
				case "-1,0": { //down
					var temp = coords[1];
					coords[1] = coords[2];
					coords[2] = (temp.length==1)?'-'+temp:temp[1];
				}; break;
				case "0,1": { //right
					var temp = coords[0];
					coords[0] = coords[2];
					coords[2] = (temp.length==1)?'-'+temp:temp[1];
				}; break;
				case "0,-1": { //left
					var temp = coords[2];
					coords[2] = coords[0];
					coords[0] = (temp.length==1)?'-'+temp:temp[1];
				}; break;
			};

			console.log('coords after',coords);
		console.groupEnd();
		
		var tX = 0,tY=0,tZ=0;
		
		return new_angles;
	}

	function rotate3d(x,y,z,degree) {
		var matrix = new WebKitCSSMatrix(DOM.style.webkitTransform);
		matrix = matrix.rotateAxisAngle(x,y,z,degree);
		DOM.style.webkitTransform = matrix.toString();
	}

	function rotate_sides () {

	};

	rotate3d(-1,-1,0,30); // initial rotation
	fill(); // initial filling

	return this;
}

var cube = new Cube('cube3d') // main cube object	


shortcut.add('up',function () {cube.make('up')});
shortcut.add('down',function () {cube.make('down')});
shortcut.add('left',function () {cube.make('left')});
shortcut.add('Right',function () {cube.make('right')});


function get_random_color (value) {
	Math.seedrandom(value);
    var color = 'rgba('+(Math.round(Math.random()*150)+55)+','+(Math.round(Math.random()*250)+5)+','+(Math.round(Math.random()*250)+5)+','+'.5)';
    Math.seedrandom();
    return color;
}