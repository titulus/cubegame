function Cube (element_id) {
	var DOM = {};
	DOM.cube = document.getElementById(element_id);
	DOM.side = {}
	DOM.value = {}
	DOM.score = document.getElementById('score_value');

	var axis = ['z','-y','y','-z','-x','x'];
	var side = {};
	var coords = ['x','y','z'];

	var score = 0;

	function init () {
		coords = ['x','y','z'];
		score = 0;
		DOM.score.innerHTML = score;


		DOM.cube.innerHTML = '<div id="side_-y" class="side"><span></span></div><div id="side_z" class="side"><span></span></div><div id="side_x" class="side"><span></span></div><div id="side_y" class="side"><span></span></div><div id="side_-z" class="side"><span></span></div><div id="side_-x" class="side"><span></span></div>';
		DOM.cube.style.webkitTransform = new WebKitCSSMatrix();

		for (i in axis) DOM.side[axis[i]]=document.getElementById('side_'+axis[i]);
		for (i in axis) DOM.value[axis[i]]=document.getElementById('side_'+axis[i]).childNodes[0];
		for (i in axis) {side[axis[i]]=Math.round(Math.random()*2);}

		rotate3d(-1,-1,0,30); // initial rotation
		fill(); // initial filling
	};
	this.init = init;

	function fill () { // fill DOM.cube cube sides with appropriate values
		for (i in axis) {
			var element = DOM.side[axis[i]];
			var value = side[axis[i]];
			element.childNodes[0].innerHTML=value;
			var color = get_color(value);
			element.style.backgroundColor = 'rgba('+color.join(',')+',.5)';
		}
	}

	function animate_sides(reseted,increased) {
		DOM.value[reseted].style.fontSize='50%';
		DOM.value[increased].style.fontSize='150%';
		function return_state () {
			DOM.value[reseted].style.fontSize='100%'
			DOM.value[increased].style.fontSize='100%';
		}
		setTimeout(return_state,100);
		// DOM.value[reseted].style.fontSize='100%';
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
	   		score += side[current_sides[direction]];
	   		side[current_sides.front] = get_new_value();
	   		animate_sides(current_sides.front,current_sides[direction]);
	   		fill();
	   		DOM.score.innerHTML = score;
	   		if (side[current_sides[direction]]%3==0) show_info(side[current_sides[direction]],'touch or press <i>space</i> to continue');
	   		if (check_fail()) show_info('FAIL','touch or press <i>space</i> to restart',true);
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

	function check_fail () {
		var fail = false;
		if (   side['z']!=side['-y']
	        && side['z']!=side['-x']
	        && side['z']!=side['x']
	        && side['z']!=side['y']
	        && side['-z']!=side['-y']
	        && side['-z']!=side['-x']
	        && side['-z']!=side['x']
	        && side['-z']!=side['y']
	        && side['-y']!=side['-x']
	        && side['-y']!=side['x']
	        && side['y']!=side['-x']
	        && side['y']!=side['x']) fail = true;
		return fail;
	}

	function rotate (direction) {
		var t_angles = [0,0,0];
		// console.group(direction);
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
		
		// console.log(x,y);
		// 	console.log('coords before',coords);

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

		// 	console.log('coords after',coords);
		// console.groupEnd();
		
		var tX = 0,tY=0,tZ=0;
		
		return new_angles;
	}

	function rotate3d(x,y,z,degree) {
		var matrix = new WebKitCSSMatrix(DOM.cube.style.webkitTransform);
		matrix = matrix.rotateAxisAngle(x,y,z,degree);
		DOM.cube.style.webkitTransform = matrix.toString();
	}

	init();

	return this;
}

var cube = new Cube('cube3d') // main cube object	


function set_shortcut () {
	shortcut.add('up',function () {cube.make('up')});
	shortcut.add('down',function () {cube.make('down')});
	shortcut.add('left',function () {cube.make('left')});
	shortcut.add('Right',function () {cube.make('right')});
}
set_shortcut();
function remove_shortcut () {
	shortcut.remove('up');
	shortcut.remove('down');
	shortcut.remove('left');
	shortcut.remove('Right');
}

function get_color (value) {
	Math.seedrandom(value);
    var color = [(Math.round(Math.random()*150)+55),(Math.round(Math.random()*250)+5),(Math.round(Math.random()*250)+5)];
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

function show_info (h1,p,reset) {
	var DOM_info = document.getElementById('info');
	var DOM_h1 = document.getElementById('info_h1');
	var DOM_p = document.getElementById('info_p');
	DOM_h1.innerHTML = h1;
	DOM_p.innerHTML = p;
	DOM_info.style.backgroundColor = 'rgba('+get_color(h1).join(',')+',.5)';
	DOM_info.style.display = 'block';
	DOM_info.childNodes[0].style.paddingTop = '100px';
	
	setTimeout(function(){
		DOM_info.style.opacity = 1;
	},0);

	shortcut.add('space',function () {hide_info(reset)});
	remove_shortcut();
}

function hide_info (reset) {
	var DOM_info = document.getElementById('info');
	DOM_info.style.backgroundColor = '';
	DOM_info.style.opacity = 0;
	DOM_info.childNodes[0].style.paddingTop = 0;
	setTimeout(function(){DOM_info.style.display = 'none';},0);
	shortcut.remove('space');
	set_shortcut();
	if (reset) cube.init();
}
