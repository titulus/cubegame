function Cube (element_id) {
	var DOM = {};
	DOM.cube = document.getElementById(element_id);
	DOM.side = {}
	DOM.value = {}
	DOM.score = document.getElementById('score');
	DOM.max = document.getElementsByClassName('max');
	this.DOM = DOM;

	var axis = ['x','y','z','-x','-y','-z'];
	var side = {};
	this.side = side;
	var coords = ['x','y','z'];

	var score = 0;
	var max_value = 0;
	this.end = false;

	function init (sides) {
		coords = ['x','y','z'];
		score = 0;
		max_value = 0;
		this.end = false;

		DOM.cube.innerHTML = '<div id="side_-y" class="side"><span></span></div><div id="side_z" class="side front"><span></span></div><div id="side_x" class="side"><span></span></div><div id="side_y" class="side"><span></span></div><div id="side_-z" class="side"><span></span></div><div id="side_-x" class="side"><span></span></div>';
		DOM.cube.style.webkitTransform = new WebKitCSSMatrix();
		DOM.score.innerHTML = score;

		for (i in axis) DOM.side[axis[i]]=document.getElementById('side_'+axis[i]);
		for (i in axis) DOM.value[axis[i]]=document.getElementById('side_'+axis[i]).childNodes[0];
		for (i in axis) {side[axis[i]]=(sides)?sides[i]:Math.round(Math.random()*2);}
		sides = undefined;

		rotate3d(-1,-1,0,30); // initial rotation
		rotate_sides()
		fill(); // initial filling
	};
	this.init = init;

	function fill () { // fill DOM.cube cube sides with appropriate values
		for (i in axis) {
			var element = DOM.side[axis[i]];
			var value = side[axis[i]];
			element.childNodes[0].innerHTML=value;
			var color = get_color(value);
			element.style.backgroundColor = 'rgba('+color.join(',')+',.8)';
			// element.style.webkitBoxShadow = '0 0 .1em rgb('+color.join(',')+')';
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

	function make (direction,value) {
		var current_sides = {};
		current_sides.front = coords[2];
		current_sides.down = coords[1];
		current_sides.right = coords[0]
		current_sides.back = (current_sides.front.length==1)?'-'+current_sides.front:current_sides.front[1];
		current_sides.up = (current_sides.down.length==1)?'-'+current_sides.down:current_sides.down[1];
		current_sides.left = (current_sides.right.length==1)?'-'+current_sides.right:current_sides.right[1];
	    var front_value = side[current_sides.front];
	    var compare_value = side[current_sides[direction]];

	   	if (front_value!=compare_value) {
	   		rotate(direction);
	   	} else {
	   		var max_value_changed = false;
			side[current_sides[direction]]++;
			if (side[current_sides[direction]]>max_value) {
				max_value=side[current_sides[direction]];
				max_value_changed = true;

				for (i in DOM.max) {
		   			DOM.max[i].innerHTML = max_value;
		   		}
			}

	   		score += side[current_sides[direction]];

	   		side[current_sides.front] = (value!=undefined)?value:get_new_value();

	   		animate_sides(current_sides.front,current_sides[direction]);
	   		fill();
	   		DOM.score.innerHTML = score;


	   		if (check_fail()) {
	   			this.end = true;
	   			ga('send', 'event', 'max', 'max-'+side[current_sides[direction]]);
	   			
	   		} else this.end = false;

	   		/*
			this.end - fail
			max_value - max
			score - score
	   		*/

	   		var info_show=false;
	   		var fail_text = "... and <b>"+score+'</b> points.<br/>but there are no other moves...<br/><br/><span class="touch">tap</span> or press <span class="key">space</span> to restart<br/>See source on <a href="//github.com/titulus/cubegame">github</a>';
   			var header = max_value;
   			var top = '';
   			var text = '';
	   		if (max_value_changed) {
	   			if (max_value==5) {
	   				top = 'CONGRATULATIONS!';
	   				text = 'try to get 10 (;';
	   				info_show = true;
	   			}
	   			if (max_value==10) {
	   				top = 'YOU <b>WON</b>!';
	   				text = 'So... can you get 15?';
	   				ga('send', 'event', 'game', 'win');
	   				info_show = true;
	   			}
	   			if (max_value==15) {
	   				top = 'AMAZING!';
	   				text = "I'll bet - you will do 20!";
	   				info_show = true;
	   			}
	   			if (max_value>=20) {
	   				top = ['CONGRATULATIONS!','UNBELIEVABLE!','What a wonder!','Is that real?'];
	   				top = top[Math.floor(Math.random()*top.length)];
	   				text = 'Try to get '+(max_value+1);
	   				info_show = true;
	   			};
	   		};
   			if (this.end) {
   				text = fail_text;
   				top = (top=='')?'So sorry ):':top;
				info_show = true;
   			} else text +='<br/><span class="touch">tap</span> or press <span class="key">space</span> to continue<br/>See source on <a href="//github.com/titulus/cubegame">github</a>';
   			if (info_show) {
   				toggle_info({top:top,header:header,text:text,color:[255,25,25]});
   				status = 'infobox'
   			};
	   	};	
	   	var prev_front = document.getElementsByClassName('front')[0];
	   	prev_front.className='side';
	   	DOM.side[coords[2]].className='side front';
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
            rand = (rand < 3)?0:(rand < 9)?1:2;
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
	    update_coords(direction);
		rotate3d(t_angles[0],t_angles[1],t_angles[2],90);

		rotate_sides(direction);
	}
	this.rotate = rotate;
	function rotate_sides() {
	
		function rotate_side (side,angles) {
			DOM.value[side].style.webkitTransform = 'rotateX('+angles[0]+'deg) rotateY('+angles[1]+'deg) rotateZ('+angles[2]+'deg)';
		};
		function rotate_both_sides (side,angles) {
			rotate_side(side,angles);
			rotate_side('-'+side,angles);
		}

		switch(coords.join(',')) {
			case 'x,y,z' : { //default
				rotate_both_sides('x',[0,0,0]);
				rotate_both_sides('y',[0,0,0]);
				rotate_both_sides('z',[0,0,0]);
			};break;
			case 'z,x,y' : {
				rotate_both_sides('x',[0,180,0]);
				rotate_both_sides('y',[0,180,90]);
				rotate_both_sides('z',[0,0,-90]);
			};break;
			case 'y,z,x' : {
				rotate_both_sides('x',[0,0,90]);
				rotate_both_sides('y',[0,180,0]);
				rotate_both_sides('z',[0,180,90]);
			};break;
			case 'x,-z,y' : {
				rotate_both_sides('x',[0,0,-90]);
				rotate_both_sides('y',[180,0,0]);
				rotate_both_sides('z',[0,0,0]);
			};break;
			case 'z,-y,x' : {
				rotate_both_sides('x',[180,180,0]);
				rotate_both_sides('y',[0,180,90]);
				rotate_both_sides('z',[180,180,0]);
			};break;
			case 'y,-x,z' : {
				rotate_both_sides('x',[0,0,90]);
				rotate_both_sides('y',[180,0,90]);
				rotate_both_sides('z',[0,0,90]);
			};break;
			case '-z,y,x' : {
				rotate_both_sides('x',[0,0,0]);
				rotate_both_sides('y',[0,0,-90]);
				rotate_both_sides('z',[0,180,0]);
			};break;
			case '-x,z,y' : {
				rotate_both_sides('x',[180,0,90]);
				rotate_both_sides('y',[0,180,0]);
				rotate_both_sides('z',[0,180,0]);
			};break;
			case '-y,x,z' : {
				rotate_both_sides('x',[180,0,90]);
				rotate_both_sides('y',[0,0,-90]);
				rotate_both_sides('z',[0,0,-90]);
			};break;
			case '-x,-y,z' : {
				rotate_both_sides('x',[180,0,0]);
				rotate_both_sides('y',[0,180,0]);
				rotate_both_sides('z',[0,0,180]);
			};break;
			case '-z,-x,y' : {
				rotate_both_sides('x',[0,0,0]);
				rotate_both_sides('y',[180,0,90]);
				rotate_both_sides('z',[180,0,90]);
			};break;
			case '-y,-z,x' : {
				rotate_both_sides('x',[0,0,-90]);
				rotate_both_sides('y',[0,0,180]);
				rotate_both_sides('z',[0,0,-90]);
			};break;
			case 'x,z,-y' : {
				rotate_both_sides('x',[0,0,90]);
				rotate_both_sides('y',[0,0,0]);
				rotate_both_sides('z',[180,0,0]);
			};break;
			case 'z,y,-x' : {
				rotate_both_sides('x',[0,180,0]);
				rotate_both_sides('y',[0,0,90]);
				rotate_both_sides('z',[0,0,0]);
			};break;
			case 'y,x,-z' : {
				rotate_both_sides('x',[0,180,90]);
				rotate_both_sides('y',[0,180,90]);
				rotate_both_sides('z',[0,180,90]);
			};break;
			case 'x,-y,-z' : {
				rotate_both_sides('x',[0,0,180]);
				rotate_both_sides('y',[0,180,0]);
				rotate_both_sides('z',[180,0,0]);
			};break;
			case 'z,-x,-y' : {
				rotate_both_sides('x',[180,0,0]);
				rotate_both_sides('y',[0,0,90]);
				rotate_both_sides('z',[0,0,90]);
			};break;
			case 'y,-z,-x' : {
				rotate_both_sides('x',[0,180,90]);
				rotate_both_sides('y',[180,0,0]);
				rotate_both_sides('z',[0,0,90]);
			};break;
			case '-y,-x,-z' : {
				rotate_both_sides('x',[0,0,-90]);
				rotate_both_sides('y',[0,0,90]);
				rotate_both_sides('z',[180,0,90]);
			};break;
			case '-x,-z,-y' : {
				rotate_both_sides('x',[0,180,90]);
				rotate_both_sides('y',[180,180,0]);
				rotate_both_sides('z',[0,0,180]);
			};break;
			case '-z,-y,-x' : {
				rotate_both_sides('x',[180,0,0]);
				rotate_both_sides('y',[180,0,90]);
				rotate_both_sides('z',[180,0,0]);
			};break;
			case '-x,y,-z' : {
				rotate_both_sides('x',[0,180,0]);
				rotate_both_sides('y',[0,0,180]);
				rotate_both_sides('z',[0,180,0]);
			};break;
			case '-z,x,-y' : {
				rotate_both_sides('x',[180,0,0]);
				rotate_both_sides('y',[0,0,-90]);
				rotate_both_sides('z',[0,180,90]);
			};break;
			case '-y,z,-x' : {
				rotate_both_sides('x',[180,0,90]);
				rotate_both_sides('y',[0,0,0]);
				rotate_both_sides('z',[180,0,90]);
			};break;
		};
	};

	function update_coords (direction) {
		switch (direction) {
			case "up": { //up
				var temp = coords[2];
				coords[2] = coords[1];
				coords[1] = (temp.length==1)?'-'+temp:temp[1];
			}; break;
			case "down": { //down
				var temp = coords[1];
				coords[1] = coords[2];
				coords[2] = (temp.length==1)?'-'+temp:temp[1];
			}; break;
			case "right": { //right
				var temp = coords[0];
				coords[0] = coords[2];
				coords[2] = (temp.length==1)?'-'+temp:temp[1];
			}; break;
			case "left": { //left
				var temp = coords[2];
				coords[2] = coords[0];
				coords[0] = (temp.length==1)?'-'+temp:temp[1];
			}; break;
		};
	}
	function convert_angles (x,y) {
		var new_angles = [0,0,0];
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

var status = '';
var touch = {start:{x:undefined,y:undefined},end:{x:undefined,y:undefined}};
var cube = new Cube('cube3d') // main cube object

function get_color (value) {
	
	switch (value) {
		case 'hello': return [50,21,82];break;
		case 0: return [75,0,125];break;
		// case 1: return [125,0,0];break;
		// case 2: return [0,125,0];break;
		// case 3: return [0,0,125];break;
		// case 4: return [125,0,125];break;
		// case 5: return [0,125,125];break;
		// case 6: return [125,125,0];break;
		// case 7: return [0,75,0];break;
		// case 8: return [0,0,75];break;
		// case 9: return [75,75,0];break;
		// case 10: return [0,75,75];break;
		// case 11: return [75,0,75];break;
		default: {
			Math.seedrandom(value);
			var color = [(Math.round(Math.random()*250)+5),(Math.round(Math.random()*250)+5),(Math.round(Math.random()*250)+5)];
    		Math.seedrandom();
    		return color;
		}
	}
	
    
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

function toggle_info (params) {
	var DOM = {};
	DOM.info = document.getElementById('info');
	DOM.top = document.getElementById('info_top');
	DOM.h1 = document.getElementById('info_h1');
	DOM.p = document.getElementById('info_p');
	if (params) {
		DOM.top.innerHTML = params.top;
		DOM.h1.innerHTML = params.header;
		DOM.p.innerHTML = params.text;
		DOM.info.style.backgroundColor = 'rgba('+((params.color)?params.color:get_color(params.header)).join(',')+',.5)';
		DOM.info.style.display = 'block';
		setTimeout(function(){DOM.info.style.opacity = 1;},0);
	} else {
		DOM.info.style.backgroundColor = '';
		DOM.info.style.opacity = 0;
		DOM.info.style.display = 'none';
		if (cube.end) cube.init();
	}
}

function touchStart (e) {
	e.preventDefault();
	touch.start.x = e.changedTouches[0].clientX;
	touch.start.y = e.changedTouches[0].clientY;
};
function touchMove (e) {};
function touchCansel (e) {};
function touchEnd (e) {
	if (e.target.nodeName != 'A') {
		e.preventDefault();
		touch.end.x = e.changedTouches[0].clientX;
		touch.end.y = e.changedTouches[0].clientY;
		touch_handler();
	} else {
		console.log(e);
	}
}

function touch_handler() {
	var evnt = '';
	var dX = touch.end.x - touch.start.x;
	var dY = touch.end.y - touch.start.y;
	if (Math.abs(dX)==Math.abs(dY)) {
		evnt = 'tap';
	} else {
		var d = 0;
		if (Math.abs(dX)>Math.abs(dY)) {
			d = Math.abs(dX);
			evnt = (dX>0)?'right':'left';
		} else {
			d = Math.abs(dY);
			evnt = (dY>0)?'down':'up';
		}
		if (d<20) evnt = 'tap';
	}
	event_handler(evnt);
}

function keyup(ev) {
	var table = {
		 27:'esc'
		,32:'space'
		,37:'left'
		,38:'up'
		,39:'right'
		,40:'down'
	};
	if (table[ev.which]) event_handler(table[ev.which])
}

function event_handler(ev) {
	switch(status) {
		case 'infobox' : {
			if (ev=='tap' || ev=='space') {
				toggle_info();
				status = 'game';
			}
		}; break;
		case 'game' : {
			if (ev == 'up' || ev == 'down' || ev == 'left' || ev == 'right') cube.make(ev);
		}; break;
		case 'hello' : {
			if (ev=='esc' || ev=='tap' || ev=='space') {
				toggle_info();
				status = 'game';
			}
		}; break;
		case 'debug' : {
			cube.rotate(ev);
		}; break;
		case 'tutorial-0' : {
			if (ev=='tap' || ev=='space') {
				tutorial(1);
			}
			if (ev=='esc' || ev=='up') {
				toggle_info();
				status = 'game';
			}
		}; break;
		case 'tutorial-1' : {
			if (ev=='up') {
				tutorial(2);
			}
		}; break;
		case 'tutorial-2' : {
			if (ev=='right') {
				tutorial(3);
			}
		}; break;
		case 'tutorial-3' : {
			if (ev=='up' || ev=='down') {
				tutorial(4,ev);
			}
		}; break;
		default: throw new Error('unexpected status: '+status);
	}
}


function update_fontsize () {
	var W = window.innerWidth;
	var H = window.innerHeight;
	document.body.style.fontSize = ((W>H)?H*0.04:W*0.04)+'px';
}
update_fontsize();

function tutorial (state,ev) {
	switch (state) {
		case 0 : {
 			toggle_info({top:'',header:'hello'
		  ,text:'Use arrowkeys <span class="key">&larr;</span>,<span class="key">&uarr;</span>,<span class="key">&rarr;</span>,<span class="key">&darr;</span><br/>or swipes <span class="touch">&larr;</span>,<span class="touch">&uarr;</span>,<span class="touch">&rarr;</span>,<span class="touch">&darr;</span> to increase chosen side, if it equal to front, or rotate cube otherwise.<br/>'
		  +'<b>Goal:</b> get <span class="sside" style="background-color: rgba(247, 72, 54, 0.8); padding:0;">10</span> on one side.<br/>'
		  +'Press <span class="key">space</span> or <span class="touch">tap</span> to see <b>tutorial</b>.<br/>'
		  +'Press <span class="key">esc</span> or swipe <span class="touch">&uarr;</span> to skip it.'
		  ,color:[255,255,125]});
			status='tutorial-0';
		}; break;
		case 1 : {
			cube.init([1,1,0,1,0,0]);
			toggle_info();
			document.getElementById('tutorial-1').style.display='block';
			setTimeout(function () {
				document.getElementById('tutorial-1').style.opacity=1;
			},0);
			status='tutorial-1';
		}; break;
		case 2 : {
			cube.make('up',2);
			document.getElementById('tutorial-1').style.opacity=0;
			
			setTimeout(function () {
				document.getElementById('tutorial-1').style.display='none';

				document.getElementById('tutorial-2').style.display='block';
				setTimeout(function () {
					document.getElementById('tutorial-2').style.opacity=1;
				},0);

			},500);

			status='tutorial-2';
		}; break;
		case 3 : {
			cube.make('right');
			document.getElementById('tutorial-2').style.opacity=0;
			
			setTimeout(function () {
				document.getElementById('tutorial-2').style.display='none';

				document.getElementById('tutorial-3').style.display='block';
				setTimeout(function () {
					document.getElementById('tutorial-3').style.opacity=1;
				},0);

			},500);

			status='tutorial-3';
		}; break;
		case 4 : {
			document.getElementById('tutorial-3').style.opacity=0;
			document.getElementById('score').style.backgroundColor='rgba(255, 255, 125, 0.5)';
			document.getElementById('score').style.boxShadow='0 0 0.5em rgb(255, 255, 125)';
			document.getElementById('score').style.webkitBoxShadow='0 0 0.5em rgb(255, 255, 125)';
			document.getElementById('score').style.color='rgb(255, 255, 125)';
			
			document.getElementById('tutorial-4').style.display='block';
			setTimeout(function () {
				document.getElementById('tutorial-4').style.opacity=1;
			},0);
			setTimeout(function () {
				document.getElementById('tutorial-3').style.display='none';
				cube.make(ev,0);
				setTimeout(function () {
					document.getElementById('score').style.backgroundColor='';
					document.getElementById('score').style.boxShadow='';
					document.getElementById('score').style.webkitBoxShadow='';
					document.getElementById('score').style.color='white';

					document.getElementById('tutorial-4').style.opacity=0;
					setTimeout(function () {
						document.getElementById('tutorial-4').style.display='none';
						status='game';
					},500);
				},1000);
			},1000);
			status='tutorial-4';

		}; break;

	}
}

 function init (state) {
 	switch (state) {
 		case 'game': {
 			cube.init();
 			toggle_info({top:'',header:'hello'
		  ,text:'press <span class="key">&larr;</span>,<span class="key">&uarr;</span>,<span class="key">&rarr;</span>,<span class="key">&darr;</span><br/>or<br/>swipe <span class="touch">&larr;</span>,<span class="touch">&uarr;</span>,<span class="touch">&rarr;</span>,<span class="touch">&darr;</span>.<br/>'
		  +'Chosen side will increased, if it equal to front, cube will rotate otherwise.<br/>'
		  +'Press <span class="key">space</span> or <span class="touch">tap</span> to close info.'
		  ,color:[125,125,255]});
 			status='infobox';
 		}; break;
 		case 'tutorial' : {
 			tutorial(0);
 		}; break;
 		case 'debug' : {
 			status = 'debug';
 			cube.init(['+.x','+.y','+.z','-.x','-.y','-.z'])
 		}; break;
 	}
 }

 init('tutorial');