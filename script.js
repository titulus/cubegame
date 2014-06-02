function Cube (element_id) {
	var DOM = {};
	DOM.cube = document.getElementById(element_id);
	DOM.side = {}
	DOM.value = {}
	DOM.score = document.getElementById('score');
	DOM.max = document.getElementsByClassName('max');
	this.DOM = DOM;

	var axis = ['z','-y','y','-z','-x','x'];
	var side = {};
	this.side = side;
	var coords = ['x','y','z'];

	var score = 0;
	var max_value = 0;
	this.end = false;

	function init () {
		coords = ['x','y','z'];
		score = 0;
		max_value = 0;
		this.end = false;

		DOM.cube.innerHTML = '<div id="side_-y" class="side"><span></span></div><div id="side_z" class="side front"><span></span></div><div id="side_x" class="side"><span></span></div><div id="side_y" class="side"><span></span></div><div id="side_-z" class="side"><span></span></div><div id="side_-x" class="side"><span></span></div>';
		DOM.cube.style.webkitTransform = new WebKitCSSMatrix();
		DOM.score.innerHTML = score;

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

	   		side[current_sides.front] = get_new_value();

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
	   		var fail_text = "... and <b>"+score+"</b> points.<br/>but there are no ather moves...<br/><br/><span class='touch'>tap</span> or press <span class='key'>space</span> to restart<br/>See source on <a href='//github.com/titulus/cubegame' target=_blank>github</a>";
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
				
   			}
   			if (info_show) show_info({top:top,header:header,text:text});
   			
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

var infobox = false;
var touch = {start:{x:undefined,y:undefined},end:{x:undefined,y:undefined}};
var cube = new Cube('cube3d') // main cube object

function get_color (value) {
	
	switch (value) {
		case 'hello': return [50,21,82];break;
		case 0: return [255,255,255];break;
		case 1: return [125,0,0];break;
		case 2: return [0,125,0];break;
		case 3: return [0,0,125];break;
		case 4: return [125,0,125];break;
		case 5: return [0,125,125];break;
		case 6: return [125,125,0];break;
		case 7: return [0,75,0];break;
		case 8: return [0,0,75];break;
		case 9: return [75,75,0];break;
		case 10: return [0,75,75];break;
		case 11: return [75,0,75];break;
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

function show_info (params) {
	var DOM_info = document.getElementById('info');
	var DOM_top = document.getElementById('info_top'); 
	var DOM_h1 = document.getElementById('info_h1');
	var DOM_p = document.getElementById('info_p');
	DOM_top.innerHTML = params.top;
	DOM_h1.innerHTML = params.header;
	DOM_p.innerHTML = params.text;
	if (cube.end) {
		DOM_info.style.backgroundColor = 'rgba(255,125,125,.5)';
		DOM_info.childNodes[0].style.boxShadow = '0 0 2em rgb(255,125,125)';
		DOM_info.childNodes[0].style.backgroundColor = 'inherit';
		DOM_h1.style.color='rgb('+get_color(params.header).join(',')+')';
		DOM_h1.style.textShadow='0 0 .5em rgb('+get_color(params.header).join(',')+')';
	} else if (params.header=='hello') {
		DOM_info.style.backgroundColor = 'rgba(125,125,255,.5)';
		DOM_info.childNodes[0].style.boxShadow = '0 0 2em rgb(125,125,255)';
		DOM_info.childNodes[0].style.backgroundColor = 'inherit';
		DOM_h1.style.color='rgb('+get_color(params.header).join(',')+')';
		DOM_h1.style.textShadow='0 0 .5em rgb('+get_color(params.header).join(',')+')';
	} else {
		DOM_info.style.backgroundColor = 'rgba('+get_color(params.header).join(',')+',.5)';
		DOM_info.childNodes[0].style.backgroundColor = 'rgba(255,255,255,.5)';
		DOM_info.childNodes[0].style.boxShadow = '0 0 2em rgb(255,255,255)';
	}

	// DOM_info.style.backgroundColor = (cube.end)?'rgba(125,0,0,.5)':'rgba('+get_color(params.header).join(',')+',.5)';
	// DOM_info.childNodes[0].style.boxShadow = '0 0 2em rgb('+((cube.end)?'125,0,0':get_color(params.header).join(','))+')';
	
	DOM_info.style.display = 'block';
	
	setTimeout(function(){
		DOM_info.style.opacity = 1;
	},0);

	infobox = true;
}
show_info({top:'',header:'hello'
		  ,text:'press <span class="key">&larr;</span>,<span class="key">&uarr;</span>,<span class="key">&rarr;</span>,<span class="key">&darr;</span><br/>or<br/>swipe <span class="touch">&larr;</span>,<span class="touch">&uarr;</span>,<span class="touch">&rarr;</span>,<span class="touch">&darr;</span>. <br/>Chosen side will increased, if it equal to front, cube will rotate otherwise. <br/> Press <span class="key">space</span> or <span class="touch">tap</span> to close info.'});

function hide_info () {
	var DOM_info = document.getElementById('info');
	DOM_info.style.backgroundColor = '';
	DOM_info.style.opacity = 0;
	setTimeout(function(){DOM_info.style.display = 'none';},0);
	infobox = false;
	if (cube.end) cube.init();
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
		 32:'space'
		,37:'left'
		,38:'up'
		,39:'right'
		,40:'down'
	}
	if (table[ev.which]) event_handler(table[ev.which])
}

function event_handler(ev) {
	if (infobox) {
		if (ev=='tap' || ev=='space') hide_info();
	} else {
		cube.make(ev);
	}
}


function update_fontsize () {
	var W = window.innerWidth;
	var H = window.innerHeight;
	document.body.style.fontSize = ((W>H)?H*0.04:W*0.04)+'px';
}
update_fontsize();