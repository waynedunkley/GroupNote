$(document).ready(function () { 

	var user;
		

/*
	$.ajax('getUserId', function(res) {
		console.log('and were back');
		user = res.username;
	});
*/
	$.ajax({
		url: "getUserId"
	}).done(function(res){
		console.log('check this' + res);
	});
	
	var socket = io.connect('http://localhost:1337');
	socket.emit('adduser', user);
	
	//set active page
	$('#content-window div:first').addClass('active');
	$('#class-menu li:first').addClass('active');
	
	function validateaddclassform(form){
		form.valid = true;
		
		//check class name
		if(form.className.length == 0){
			$('#addclassform #classname-control-group').addClass('error');
			$('#addclassform #classname-control-group .help-inline').text('required');
			form.valid = false;
		}
		
		//check date is not earlier than today
		
		return form;
	};
	function setupform(){
		$('.commentinput').submit(function(evt){
			evt.preventDefault();
			var com = $('.commentinput .nicEdit-main').html();
			console.log(com);
			
			socket.emit('addcomment', com);
			
			//clear input box
			$('.commentinput .nicEdit-main').text('');
		});
	}
	
	socket.on('updatecomments', function(name, comment){
		console.log('hieere' + name);
		var num;
		if(name == user){
			num = 1;
		}else{
			num = 2;
		}
		console.log('user is ' + user);
		$('#commentcont').append('<div class="comment-'+ num +'">'+ comment +'</div>');
	});
	
	//update classes menu 
	socket.on('addmenuitem', function(res){
		var id;
		var menuitem;
		
		if($('#class-menu li').length == 1){
			id = 1;
			//update menu
			var insert;
			insert = '<li id="menuitem'+ id +'">';
			insert += '<a href="#tab'+ id +'" data-toggle="tab">'+ res.classname +'</a>';
			insert += '</li>';
			$('#class-menu li:last-child').before(insert);
			//update content
			$('#addNewClass').before('<div id="tab'+ id +'" class="tab-pane"><p>Section '+ id +'</p></div>');
		}else{
			//get last menu item
			menuitem = $('#class-menu li:nth-last-child(2)');
			
			//get id from menuitem, parse to Int, +1 as for next item
			id = parseInt(menuitem.attr('id').replace('menuitem','')) + 1;
			
			//update menu
			menuitem.after('<li id="menuitem'+ id +'"><a href="#tab'+ id +'" data-toggle="tab">'+ res.classname +'</a></li>');
			
			//update content
			var div = $('#content-window div:nth-last-child(2)');
			var insert;
			insert = '<div id="tab'+ id +'" class="tab-pane">';
			insert += '<p>Section '+ id +'</p>';
			insert += '<button id="addComment" class="btn btn-primary" type="button">Add Comment</button>';
			insert += '<div id="comments"></div>'
			insert += '</div>';
			div.after(insert);
		}
	});
	
	
	
	
	
	//== ADD CLASS ==========
	//=======================
	
	$('#addClass').click(function(){
		//reset errors
		$('#addclassform *').removeClass('error');
		$('#addclassform .help-inline').text('');

		var form = {};
		$('#addclassform').find(':input').each(function(){
			form[this.name] = $(this).val();
		});
	
		//validate form
		form = validateaddclassform(form);
		
		form = addformUnixData(form);
		
		
		if(form.valid == true){

			//submit to server
			$.post('addClass', (form), function(res) {
				if(res.success == true){
					//get server to announce updated menu
					socket.emit('update-class-menu', res);
					
					//reset form fields
					$('#addclassform input[name="className"]').val('');
					$('#addclassform input[name="lecturer"]').val('');

					//give update msg
					$('#formnotifier').css('visibility', 'visible');

				}else if(res.success == false){
					console.log('class not saved, error on response');
				}
			});
		}else{
			console.log('form has errors');
		}
	});
	
	function addformUnixData(form){
		var split = form.date.split('-');
		
		var d = split[2] + '-' + split[1] + '-' + split[0];
			d += 'T' + form.time + ':00';
		form.unixstarttime = Date.parse(d)/1000;
		
		var l;
		switch(form.duration){
			case "30 mins": l = 1800;
			break;
			case "1 hour": l = 3600;
			break;
			case "1 hour 30 mins": l = 5400;
			break;
			case "2 hours": l = 7200;
			break;
		};
		form.unixduration = l;
		
		return form;
	};
	
	function setTDpickers(){
		$('#tp1').timepicker();
		$('#date').val(function(){
			var today = new Date(); 
			var dd = today.getDate(); 
			var mm = today.getMonth()+1; //jan is 0 
			var yyyy = today.getFullYear(); 
			if(dd < 10){
				dd = '0' + dd;
			}; 
			if(mm < 10){
				mm = '0' + mm;
			};
			return dd + '-' + mm + '-' + yyyy;
		});
		$('#dp1').datepicker();
		//CURRENTLY ABLE TO SET START DATE PRIOR TO CURRENT DATE
		
	}
	setTDpickers();
	function loadshortcuts(){
		//$('.nicEdit-main').addClass('mousetrap');
		Mousetrap.bind(['command+return', 'command+k'], function(e){
			$('.commentinput').submit();
			//alert('done');
			return false;
		})
	};
	
	function addliveform(id){
		id = id-1;
		console.log('#CIDform'+ id);
		var insert;
		insert = '<form action="" method="POST" class="commentinput">';
		//insert += '<label>Comment Input</label>';
		insert += '<textarea name="commenttext" id="textarea'+ id +'"></textarea>';
		insert += '<p class="text-info">Shortcut key: <em>cmd+return</em> or <em>ctrl+return</em> = Add Comment</p>'
		insert += '<button name="addComment" type="submit" class="btn btn-primary">Add Comment</button>';
		insert += '</form>';
		//$('#CIDform'+ id).attr('id', 'liveclass');
		$('#CIDform'+ id).addClass('liveclass');
		$('.liveclass').append(insert);	
		setupform();
		bkLib.onDomLoaded(function(){
			var myEditor = new nicEditor({buttonList : ['bold','italic','underline','left','center','right','justify','ol','ul','fontSize','xhtml','link','image'], minHeight : 100}).panelInstance('textarea' + id);
			$('.nicEdit-main').addClass('mousetrap');
			
		});
		loadshortcuts();
	};
	//pass menu item number to make live class and add comment form
	//addliveform();
	
	$(window).resize(function() {
	  //console.log($('.left-side').width() + 'px');
	  var w = $('.left-side').width()-20;
	  $('.commentinput').children().not('.btn').css('width', w + 'px');
	  $('.nicEdit-main').css('width', w-8 + 'px');
	});
	
	var collect = $('.liveclass').attr('id');
	console.log(collect);
	
	
	
	/* == TIMER ==========================
	======================================*/
	
	var timer;
	var starttime;
	var currenttime;
	
	function updateTimer(timeleft){
		
		var mins = Math.floor(timeleft / 60);
		var secs = timeleft - mins * (60);
		timer.html("<p>" + addZero(mins) + "m : " + addZero(secs) + "s</p>");
		
	}
	
	function tick(timeleft){
		timeleft -= 1;
		if(timeleft <= 0){
			
			/* LOAD LIVE FORM */
			timer.html("now started");
			
			return;
		};
		updateTimer(timeleft);
		setTimeout(function(){ 
			tick(timeleft); 
		}, 1000 );
	};
	
	function createTimer(timeleft){
		timer = $('.timer');
		updateTimer(timeleft);
		setTimeout(function(){ 
			tick(timeleft); 
		}, 1000 );
	};
	
	function addZero(t) {
		return (t < 10) ? "0" + t : + t;
	};
		
	if($('.timer input[name="starttime"]')){
		
		$('.timer').each(function(){
			var timer = {}; 
			
			timer.start = $(this).children('input[name="starttime"]').val();
			console.log('t'+timer.start);
			return;
			
			starttime = $('.timer input[name="starttime"]').val();
			console.log("s: "+starttime);
			currenttime = $('.timer input[name="currenttime"]').val();
			var timeleft = starttime - currenttime;
			createTimer(timeleft);
		});
		
		
	};
	
	/* == END OF TIMER =========================================*/

});