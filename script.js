function Cube (element_id) {
	var DOM = {};
	DOM.cube = document.getElementById(element_id);
	DOM.side = {}
	DOM.value = {}

	var axis = ['z','-y','y','-z','-x','x'];
	var side = {};
	var coords = ['x','y','z']; // initial coord system

	for (i in axis) DOM.side[axis[i]]=document.getElementById('side_'+axis[i]);
	for (i in axis) DOM.value[axis[i]]=document.getElementById('side_'+axis[i]).childNodes[0];
	for (i in axis) {side[axis[i]]=Math.round(Math.random()*2);}

	function fill () { // fill DOM.cube cube sides with appropriate values
		for (i in axis) {
			var element = DOM.side[axis[i]];
			var value = side[axis[i]];
			element.childNodes[0].innerHTML=value;
			element.style.backgroundColor = get_random_color(value);
		}
	}

	function make (direction) {
		var current_sides = {};
		current_sides.front = coords[2];
		current_sides.down = coords[1];
		current_sides.right = coords[0]
		current_sides.back = (current_sides.front.length==1)?'-'+current_sides.front:current_sides.front[1];
		current_sides.up = (current_sides.down.length==1)?'-'+current_sides.down:current_sides.down[1];
		current_sides.left = (current_sides.right.length==1)?'-'+current_sides.right:current_sides.right[1];
		// console.log(current_sides);
	    var front_value = side[current_sides.front];
	    // console.log(front_value)
	    var compare_value = side[current_sides[direction]];
	    // console.log(compare_value);

	   	if (front_value!=compare_value) {
	   		rotate(direction);
	   	} else {
	   		side[current_sides[direction]]++;
	   		side[current_sides.front] = get_new_value();
	   		fill();
	   	}
	};
	this.make = make;

	function get_new_value () {
		var values = unique([side['x'],side['-x'],side['y'],side['-y'],side['-z']]).sort();
		if (values[0]!=0) values.unshift(values[0]-1);
		var rand = 0;
        if (values.length==2) {
            rand = Math.round(Math.random());
        } else if (values.length>2) {
            rand = Math.round(Math.random()*9);
            rand = (rand < 4)?0:(rand < 9)?1:2;
        }

		return values[rand];
	}

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
		rotate_sides();
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
		var matrix = new WebKitCSSMatrix(DOM.cube.style.webkitTransform);
		matrix = matrix.rotateAxisAngle(x,y,z,degree);
		DOM.cube.style.webkitTransform = matrix.toString();
	}

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

function unique(arr) {
  var obj = {};
  var result = [];
 
  nextInput:
  for(var i=0; i<arr.length; i++) {
    var str = arr[i];
    for(var j=0; j<result.length; j++) {
      if (result[j] == str) continue nextInput;
    }
    result.push(str);
  }
  
  return result;
}