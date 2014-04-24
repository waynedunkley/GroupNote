$(document).ready(function () { 
	
	var socket = io.connect('http://localhost:1337');
	
	$.urlParam = function(name){
		var results = new RegExp('[\\?&amp;]' + name + '=([^&amp;#]*)').exec(window.location.href);
		if(results){
			return results[1] || 0;	
		}else{
			return;
		}
	};
	
	//=========== SEARCH QUERY ================
	//=========================================
	
	$('#queryform').submit(function(evt){
		evt.preventDefault();
		$('.document-page').html('<div class="center"><img src="img/searching.gif" class="searching"/><p class="italic">searching</p></div>');
		
		var unit = $('#queryform select option:selected').val();
		
		socket.emit('searchQuery', localStorage, unit);
		
	});
	
	socket.on('searchQuery', function(c){
	
		var query = $('#queryform input[name=query]').val();
		if(c){
			var results = [];
		
			for(var x=0; x<c.length; x++){
				if(c[x].comments){
					for(var i=0; i < c[x].comments.length; i++){
						var search = new RegExp(query, "i");
						if(c[x].comments[i].comment.match( search )){
							results.push(c[x].comments[i].comment);
						};
					};
				}
			}
			
			$('.document-page').html('');
			
			if(results.length != 0){
				for(var z=0; z<results.length; z++){
					$('.document-page').append('<div>' + results[z] + '</div');
				}
			}else{
				$('.document-page').append('<div class="center">** Nothing was found **</div');
			}
		}else{
			$('.document-page').append('<div class="center">** Nothing was found **</div');
		};
	});


	//==== UPDATE COMPLETED DOCS ==============
	//=========================================
	
	var doc_id = $.urlParam('doc_id');
	
	socket.emit('getDocContents', localStorage, doc_id);
	
	socket.on('getDocContents', function(contents){			
		if(contents){
			for(var x=0; x < contents.length; x++){
				$('.document-page').append('<div>' + contents[x].comment + '</div');
			};
		}else{			
			$('.document-page').append('<div class="center">** There were no notes from this session **</div');
		};
	});
	
	//=========================================
	
	//============== FONT RESIZE ==============
	//=========================================
	
	$('#increasefont').click(function(){	
		$('.document-page').css({'font-size': '+=1', 'line-height': function(){
			var s = $(this).css('line-height').replace('px', '');
			s = s-1+3;
			console.log(s);
			return s + 'px';
		}});
	});
	$('#decreasefont').click(function(){	
		$('.document-page').css({'font-size': '-=1', 'line-height': function(){
			var s = $(this).css('line-height').replace('px', '');
			s = s-2;
			console.log(s);
			return s + 'px';
		}});
	});
	$('#resetfont').click(function(){	
		$('.document-page').css({'font-size': '15px', 'line-height': '20px'});
	});
	
	//============== PDF DOWNLOAD =============
	//=========================================
	
/*
	$('#pdf-download').click(function(){
		
		//var doc = {};
		
		var doc = $('#document-page').html();

		$.post('/pdf',{ 'doc': doc }, function(pdf){
			//console.log(pdf);
			window.open(pdf);
		});
	});
*/
	
	

});