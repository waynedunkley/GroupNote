$(document).ready(function(){

	var socket = io.connect('http://localhost:1337');
	
	/*== ADD CLASS/UNIT FORM VALIDATION =====
	 ========================================*/
	$('#addcrsform').submit(function(evt){
		evt.preventDefault();
		return Validate(this, 'crs');
	});
	$('#addunitform').submit(function(evt){
		evt.preventDefault();
		return Validate(this, 'unit');
	});
	/*
$('#addclassform').submit(function(evt){
		evt.preventDefault();
		return Validate(this, 'class');
	});
*/
	
	function checkinput(form, type){
		$('#add'+ type +'form *').removeClass('error');
		$('#add'+ type +'form .help-inline').text('');
		
		if (form.name.value.length == 0){
			$('#add'+ type +'form #crs-control-group').addClass('error');
			$('#add'+ type +'form #crs-control-group .help-inline').text('field empty');
			return false;
		}
		return true;
	};
	
	function Validate(form, type){
		if (checkinput(form, type)){
			//validate on server
			$.post('add' + type, ($(form).serialize()), function(res) {
				if(res.success == false){
					$('#add'+ type +'form #crs-control-group').addClass('error');
					$('#add'+ type +'form #crs-control-group .help-inline').text('already exists');
				}else{
					//successfully added, forward to relavent page
					switch(type){
						case 'crs': 
							socket.emit('updatecrslist', res.newcrs);
							break;
						case 'unit':
							socket.emit('updateunitlist', res.newunit);
							break;
						case 'class':
							window.location.replace("./");
							break;
					}
				};
			});
		};
	};
	
	
	/* == AUTOCOMPLETE FUNCTIONALITY
	 ==================================*/
	 
	$('#addunitform input[name=name]').focus(function(){
		$.getJSON('./ac_units', function(json){
			$('#addunitform input[name=name]').autocomplete({ 
			lookup: json,
			//serviceUrl: '/ac_units',
			onSelect: function(suggestion){
				//alert('You selected: ' + suggestion.value + ', ' + suggestion.data);
			}
		});
		});
	});
	$('#addclassform input[name=lecturer]').focus(function(){
		$.getJSON('./ac_lecturers', function(json){
			$('#addclassform input[name=lecturer]').autocomplete({ 
			lookup: json,
			//serviceUrl: '/ac_units',
			onSelect: function(suggestion){
				//alert('You selected: ' + suggestion.value + ', ' + suggestion.data);
			}
		});
		});
	});
	
	
	
	/* == SOCKETS ===========
	 ========================*/
	 
	socket.on('updatecrslist', function(newcrs){
		
		$('#courselist').append('<li><i class="icon-book"></i><a href="/course?name=' + newcrs + '">' + newcrs + '</a></li>');
		$('input[name=name]').val('');
	});
	
	socket.on('updateunitlist', function(newunit){
	
		if($('#unitslist')[0]){
			$('#unitslist').append('<li><i class="icon-book"></i><a href="/unit?name=' + newunit + '">' + newunit + '</a></li>');
		}else{
			console.log('FIRED');
			$('.inner-center').html('<ul id="unitslist" class="nav-lists"><li><i class="icon-book"></i><a href="/unit?name=' + newunit + '">'+ newunit +'</a></li></ul>');
		}
		
		$('input[name=name]').val('');
	});
	

	/* == LOGOUT - CLEAR LOCAL STORAGE ====
	 ======================================*/
	 
	 $('#logout').click(function(){
		 localStorage.clear();
	 });

});