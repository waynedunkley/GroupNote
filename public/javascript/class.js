$(document).ready(function () { 
	
	var socket = io.connect('http://localhost:1337');

	$.ajax({
		url: "getUserData"
	}).done(function(res){
		localStorage.setItem('course', res.data.course);
		localStorage.setItem('unit', res.data.unit);

		socket.emit('adduser', res.data);
	});

	//set active page
	$('#content-window div:first').addClass('active');
	$('#class-menu li:first').addClass('active');
	
	
	socket.on('updatecomments', function(obj, user){
		
		if(obj.unit != localStorage.getItem('unit') || obj.course != localStorage.getItem('course') || obj.uni != localStorage.getItem('uni')){
			return;
		}

		var num;
		if(user.user_id == localStorage.getItem('user_id')){
			num = 1;
		}else{
			num = 2;
		}
		//console.log('user is ' + userData.username);
		console.log(obj.id);
		$('#commentcont' + obj.id).append('<div class="comment-'+ num +' comment">'+ obj.comment +'</div>');
		scrollDown(obj.id);
	});
	
	function scrollDown(id){
		var wtf    = $('#commentcont' + id);
		var height = wtf[0].scrollHeight;
		console.log(height);
		wtf.animate({scrollTop: height}, 'slow');
	};
	
	
	
	
	
	
/*===== ADD MENU ITEMS FOR NEWLY CREATED CLASSES ========================*/
/*=======================================================================*/
	
	socket.on('addmenuitem', function(res){
		
		//check that new class is for this unit
		if(res.unit !== localStorage.getItem('unit')){
			return;
		}
		
		var id;
		var menuitem;
		
		if($('#class-menu li').length == 1){
			id = 1;
		}else{
			//get last menu item
			menuitem = $('#class-menu li:nth-last-child(2)');
			
			//get id from menuitem, parse to Int, +1 as for next item
			id = parseInt(menuitem.attr('id').replace('menuitem','')) + 1;
		};
			
		//update menu
		var insert;
		insert = '<li id="menuitem'+ id +'">';
		insert += '<a href="#tab'+ id +'" data-toggle="tab">'+ res.classname +'</a>';
		insert += '</li>';
		$('#class-menu li:last-child').before(insert);
			
		//update content
		var content = '<div id="tab'+ id +'" class="tab-pane">';
		content += '<h3>Class has been created to see class please refresh page</h3>';
		content += '<button class="btn" type="button" onClick="window.location.reload()">Refresh Page</button>';
		content += '</div>';
		
		$('#addNewClass').before(content);
					
	});
	

/*===================== ADD CLASS FORM ==================================*/
/*=======================================================================*/
	
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
					socket.emit('update-class-menu', res.newClass);
					
					//reset form fields
					$('#addclassform input[name="className"]').val('');
					$('#addclassform input[name="lecturer"]').val('');

					//give update msg
					$('#formnotifier').css('display', 'block');

				}else if(res.success == false){
					//alert("Class not saved! Reason: " + res.msg);
					$('#forminfo strong').html(res.msg);
					$('#forminfo').css('display', 'block');
					console.log(res.msg);
				}
			});
		}else{
			console.log('form has errors');
		}
	});
	
	
/*============ VALIDATE NEW CLASS FORM ==================================*/
/*=======================================================================*/
	
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
	
	
/*================= ADD UNIX DATA =======================================*/
/*=======================================================================*/
	
	function addformUnixData(form){
		var split = form.date.split('-');
		
		var d = split[2] + '-' + split[1] + '-' + split[0];
		d += 'T' + form.time + ':00';
		temp = Date.parse(d)/1000;
		form.unixstarttime = parseInt(temp);
		
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
	
	
	
/*===== TIME/DATE PICKERS FOR NEW CLASS FORM ============================*/
/*=======================================================================*/
	
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
	
	
/*============== LOAD SHORTCOUTS ========================================*/
/*=======================================================================*/
	
	function loadshortcuts(name){

		Mousetrap.bind('command+return', function(e){
			$('#' + name + ' .commentinput').submit();
			return false;
		})
	};
	
/*=================== COMMENT SUBMISSION ================================*/
/*=======================================================================*/
	
	function setupform(id, name){
		$('#' + name + ' .commentinput').submit(function(evt){
			evt.preventDefault();

			if($('.nicEdit-main').html() == ""){
				return;
			}
			var obj = {};
			obj.comment = $('.nicEdit-main').html();
			obj.id = id;
			obj.timestamp = Math.round(new Date().getTime()/1000)+3600;
			
			obj.unit = localStorage.getItem('unit');
			obj.course = localStorage.getItem('course');
			obj.uni = localStorage.getItem('uni');
			
			//== send message==
			socket.emit('addcomment', obj, localStorage);
			
			//clear input box
			$('.commentinput .nicEdit-main').text('');
		});
	}
	
/*=================== ADD LIVE FORM =====================================*/
/*=======================================================================*/
	
	function addEditors(){
	
		var name = $('.editor').attr('id');
		var id = name.replace('CIDform','');		
		var insert;
		insert = '<form action="" method="POST" class="commentinput">';
		insert += '<textarea name="commenttext" id="textarea'+ id +'"></textarea>';
		insert += '<p class="text-info">Shortcut key: <em>cmd+return</em> or <em>ctrl+return</em> = Add Comment</p>'
		insert += '<button name="addComment" type="submit" class="btn btn-primary">Add Comment</button>';
		insert += '</form>';
		
		$('#' + name).append(insert);
		
		setupform(id, name);
		
		bkLib.onDomLoaded(function(){
			var myEditor = new nicEditor({buttonList : ['bold','italic','underline','left','center','right','justify','ol','ul','fontSize','link','image'], minHeight : 150}).panelInstance('textarea' + id);
			$('.nicEdit-main').addClass('mousetrap');
			
		});
		loadshortcuts(name);
	};
	
	if($('.editor')[0]){
		var id = $('.editor').attr('id').replace('CIDform','');;
		addEditors();
		setRemaining(id);
	};
	
	
/*=================== UPDATE LIVE FEED ==================================*/
/*=======================================================================*/
	
	//if there is a live feed, fetch comments from server
	if($('.livecomments')[0]){
	
		var div = $('.livecomments');
		var feedId = div.attr('id').replace('commentcont','');
		
		socket.emit('updateFeed', feedId, localStorage);
	};

	//upon server response update live comment feed
	socket.on('updateFeed', function(cl){
		
		var div = $('.livecomments');
		
		//checks if any comments in DB, prevents uncaught error on .length; if no comments yet exist
		if(cl.cl.comments){
			for(var x=0; x < cl.cl.comments.length; x++){
				var num;
				
				//check if comment is from current user
				if(cl.cl.comments[x].author == localStorage.getItem('user_id')){
					num = 1;
				}else{
					num = 2;
				}
				//add to comments feed
				div.append('<div class="comment-'+ num +' comment">' + cl.cl.comments[x].comment + '</div');
			}
		}
		
	});
	
	
/*=================== UPDATE COMPLETED DOCUMENT =========================*/
/*=======================================================================*/
	
	if($('.finisheddoc')[0]){
		socket.emit('getCompletedClasses', localStorage);
	};
	socket.on('getCompletedClasses', function(list){
		//console.log(list[0].classes);
		
		$('.finisheddoc').each(function(){
			var id = $(this).attr('id').replace('finisheddoc','');
			var div = $('#finisheddoc'+ id);
			
			if(list[0].classes[id].comments){
				for(var x=0; x < list[0].classes[id].comments.length; x++){
					div.append('<div>' + list[0].classes[id].comments[x].comment + '</div');
				};
			}else{
				div.append('<div class="center">** There were no notes from this session **</div>');
			};
			
			
			
		});
	});
	
/*====================== ACTIVATE CLASS =================================*/
/*=======================================================================*/
	
	function activateClass(id){
		console.log('called');
		//change status
		$('#status' + id).html('live');
		$('#startsin' + id).replaceWith('<p id="remaining'+ id +'">Remaining: </p>');
		$('#timer' + id).replaceWith('<p id="remainingtimer'+ id +'"><span class="numbers">timer</span></p>');
		setRemaining(id);
		
		//add/start countdown to finish
		
		
		//add liveform		
		var insert;
		insert = '<form action="" method="POST" class="commentinput">';
		insert += '<textarea name="commenttext" id="textarea'+ id +'"></textarea>';
		insert += '<p class="text-info">Shortcut key: <em>cmd+return</em> or <em>ctrl+return</em> = Add Comment</p>'
		insert += '<button name="addComment" type="submit" class="btn btn-primary">Add Comment</button>';
		insert += '</form>';
		
		$('#CIDform' + id).append(insert);
		
		setupform(id, 'CIDform' + id);
		
		var myEditor = new nicEditor({buttonList : ['bold','italic','underline','left','center','right','justify','ol','ul','fontSize','xhtml','link','image'], minHeight : 150}).panelInstance('textarea' + id);
		$('.nicEdit-main').addClass('mousetrap');

		loadshortcuts('CIDform' + id);

		//add comments feed
		$('#commentcont' + id).addClass('livecomments');
	};
	
/*
	function createCountdown(){
		//timer.data = {};	
		
		
	}
*/
	

/*======================== END CLASS ====================================*/
/*=======================================================================*/	
	
	function endClass(id){

		//remove textarea
		$('#CIDform' + id).html('').removeClass('editor');
		
		//update status
		$('#status' + id).html('complete');
		
		//remove remaining + timer
		$('#remaining' + id).remove();
		$('#remainingtimer' + id).remove();
		
		//update completed doc
		var num = parseInt(id) + 1;
		$('#tab' + num + ' .right-side').addClass('finished');
		
		var comments = $('#commentcont' + id).html();
		var find = '<div class="comment-[1,2] comment">';
		var re = new RegExp(find, 'g');
		var comments = comments.replace(re, '<div>');
		
		$('#commentcont' + id).removeClass('commentcont livecomments').removeAttr('id').addClass('doccontainer').html('<div class="doc-control-bar center"><a href="/documentviewer?doc_id='+ id +'"><i class="icon-resize-full"> </i><span>fullscreen</span></a></div><div id="finisheddoc'+ id +'" class="finisheddoc"><div class="center">** There were no notes from this session **</div></div>');
		
		var div = $('#finisheddoc'+ id);
		if(comments){
			div.html(comments);
			
		}else{
			div.html('<div class="center">** There were no notes from this session **</div>');
		};
	}
	
/*=================== COUNTDOWN TIMER ===================================*/
/*=======================================================================*/
	
	function updateTimer(timer){
		
		var mins = Math.floor(timer.data.remain / 60);
		var secs = timer.data.remain - mins * (60);

		timer.html("<p>" + addZero(mins) + "m : " + addZero(secs) + "s</p>");
		
	}
	
	function tick(timer){
		timer.data.remain -= 1;
		
		if(timer.data.remain <= 0){
			
			/* LOAD LIVE FORM */
			//timer.html("now started");
			var id = $(timer).attr('id').replace('timer', '');
			activateClass(id);
			return;
		};
		updateTimer(timer);
		setTimeout(function(){ 
			tick(timer); 
		}, 1000 );
	};
	
	function createTimer(timer){
		timer.data = {};	
		timer.data.start = $(timer).children('input[name="starttime"]').val();
		timer.data.current = $(timer).children('input[name="currenttime"]').val();
		timer.data.remain = timer.data.start - timer.data.current;
	
		updateTimer(timer);
		
		setTimeout(function(){ 
			tick(timer); 
		}, 1000 );
	};
	
	function addZero(t) {
		return (t < 10) ? "0" + t : + t;
	};
	
	//if a timer start has been set
	if($('.timer input[name="starttime"]')){
		
		//sets timers for each class that requires one
		$('.timer').each(function(){
			var timer = $(this);
			createTimer(timer);
		});
	};
	

	
/*=================== REMAINING TIMER ===================================*/
/*=======================================================================*/
	
	function updateRemain(timer){
		var mins = Math.floor(timer.remain / 60);
		var secs = timer.remain - mins * (60);
		
		$('#remainingtimer' + timer.id + ' .numbers').html("<p>" + addZero(mins) + "m : " + addZero(secs) + "s</p>");
	}

	function tickRemain(timer){
		timer.remain -= 1;
		
		//5 min warning
		if(timer.remain == 300){
			$('#numbers' + timer.id).css({
				'visibility': 'visible',
				'color': 'red',
				'font-weight': 'bold'
			});
			$('.toggletimer').text('hide').removeClass('xshow').addClass('xhide');
		};
		
		if(timer.remain <= 0){
			
			endClass(timer.id);
			
			return;
		};
		updateRemain(timer);
		setTimeout(function(){ 
			tickRemain(timer); 
		}, 1000 );
	};
	
	function setRemaining(id){
		
		var timer = {};
		timer.id = id;
		var s = $('#starttime' + id).val();
		var d = $('#duration' + id).val();
		var now = Math.round(new Date().getTime()/1000)+3600;
	
		//endtime = starttime + duration
		var e = parseInt(s) + parseInt(d);
		
		//remaining = end - current
		timer.remain = e - now;
		
		updateRemain(timer);
		
		setTimeout(function(){ 
			tickRemain(timer);
			$('#remainingtimer' + timer.id ).append("<span id='toggletimer"+ timer.id +"' class='toggletimer xhide'>hide</span>");
			setToggleTimer();
		}, 1000 );

	}
	
/*=================== TOGGLE TIMER ======================================*/
/*=======================================================================*/
	
	function setToggleTimer(){
		$('.toggletimer').click(function(){
			var t = $(this).attr('class').replace('toggletimer ', '');
			
			if(t == 'xhide'){
				$('.numbers').css('visibility', 'hidden');
				$(this).text('show').removeClass('xhide').addClass('xshow');
			}else if(t == 'xshow'){
				$('.numbers').css('visibility', 'visible');
				$(this).text('hide').removeClass('xshow').addClass('xhide');
			}
		});
	};
	
	
	
	
	
			/*
			var diffstart = +new Date();
var diffend = +new Date();
		var diff = diffend - diffstart;
*/
	
	


});