$(document).ready(function(){
	
	
	//VALIDATES SIGNIN FORM PRIOR TO SUBMISSION
	$('#loginform').submit(function(evt){
		evt.preventDefault();
		return Validate(this);
	})
	
	function Validate(form){
		var valid = 1;
		var y;
		console.log(form.rememberme.checked);
		
		//USERNAME FIELD
		if (form.username.value.length == 0){
			valid = 0;
			$('#loginform #username-control-group').addClass('error');
			$('#loginform #username-control-group .help-inline').text('field empty');
		}else{
			$('#loginform #username-control-group').removeClass('error');
			$('#loginform #username-control-group .help-inline').text('');
		}
		
				
		//CHECK PASSWORD
		(function(){
			var pass1 = form.password.value;
			var passval = true;
			
			if(pass1.length < 6){
				$('#loginform #password1-control-group').addClass('error');
				$('#loginform #password1-control-group').addClass('error');
				$('#loginform #password1-control-group .help-inline').text('min. of 6 characters');
				passval = false;
			}else{
				$('#loginform #password1-control-group').removeClass('error');
				$('#loginform #password1-control-group .help-inline').text('');
			}
			if(passval == false){
				valid = 0;
			};
		})();
		
		//CHECK IF FORM VALID NOT VALID
		if (valid == 0){
			return false;
		}
		form.remember = "hello";
		
		//validate on server
		$.post('login', ($(form).serialize()), function(res) {
			if(res.success == false){
				if(res.msg == 1){
					//user not found
					$('#loginform #username-control-group').addClass('error');
					$('#loginform #username-control-group .help-inline').text('user not found');
				}else{
					$('#loginform #username-control-group').removeClass('error');
					$('#loginform #username-control-group .help-inline').text('');
				}
				if(res.msg == 2){
					$('#loginform #password1-control-group').addClass('error');
					$('#loginform #password1-control-group .help-inline').text('incorrect password');
				}else{
					$('#loginform #password1-control-group').removeClass('error');
					$('#loginform #password1-control-group .help-inline').text('');
				}
				$("#loginform input[type='password']").val('');
			}else{
				//successful signup, forward to homepage
				localStorage.setItem('username', res.sessionObj.username);
				localStorage.setItem('uni', res.sessionObj.university);
				localStorage.setItem('user_id', res.sessionObj.user_id);
				window.location.replace("./");
			}
		});
	}
	
});