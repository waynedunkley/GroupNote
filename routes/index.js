var db = require("../db");
var bcrypt = require('bcrypt');
var salt = bcrypt.genSaltSync(10);



exports.home = function(req, res){

	//login test
	if(!req.session.user_id){
		req.session = {};
		res.render('login');
	}else{
		if(req.session.course){
			//get list of course units
			db.uni.findOne({ university: req.session.university, course: req.session.course }, function(err, result){
				console.log(result);
				res.render('units', { username: req.session.username, uni: result.university, units: result.units, course: result.course });
			});
		}else{
			//get list of courses related to Uni
			db.uni.find({ university: req.session.university },{ course: 1 }, function(err, crss){
				console.log('HERE');
				console.log("LOOKING");
		console.log(req);
				console.log(crss);
				
				//send index.jade
				res.render('index', { username: req.session.username, uni: req.session.university, crs: crss });
			});	
		};
	};
};

/*== REGISTER ====
 ================*/

exports.register_post = function(req, res){
	var username = req.body.username;
	var email = req.body.email;
	var password = req.body.password;
	var uni = req.body.unisuggest;
	var success = true;
	var usernameaval = true;
	var emailaval = true;
	
	//check username is free
	db.users.find({ username: username }, function(err, user) {
		//username if free
		if(user == ""){
			//check email not already registered
			db.users.find({ email: email }, function(err, mail) {
				if(mail == ""){ //username if free
					//encrpyt password
					var hash = bcrypt.hashSync(password, salt);
					db.users.save({ username: req.body.username, email: req.body.email, university: uni, password: hash }, function(err, saved){
						console.log(saved); 
						req.session.username = saved.username;
						//req.session.email = saved.email;
						req.session.university = saved.university;
						req.session.user_id = saved._id;
						res.json({ success: success });
					});
				}else{
					emailaval = false;
					success = false;
					res.json({ success: success, usernameaval: usernameaval, emailaval: emailaval});
				}
			});
		}else{
			usernameaval = false;
			success = false;
			res.json({ success: success, usernameaval: usernameaval, emailaval: emailaval});
		}
	});
};



/*== LOGIN ====
 ==============*/

exports.login_post = function(req, res){
	var username = req.body.username;
	var password = req.body.password;
	var remember = req.param('rememberme'); //either: on or undefined
	var success = true;
	var msg; //1= user not found, 2= password incorrect
	
	db.users.findOne({ username: username }, function(err, user) {
		if(user != undefined || user != null){
			console.log(user);
			console.log(user.username + ' found');
			//password check
			if(bcrypt.compareSync(password, user.password)){
				
				//store all details except password
				req.session.username = user.username;
				req.session.email = user.email;
				req.session.university = user.university;
				req.session.user_id = user._id;
				if(user.course != undefined){
					req.session.course = user.course;
				}
				var sessionObj = req.session;
				/********************************************************
				if(remember == undefined){
					res.cookie('username', username, { maxAge: 1 });
					res.cookie('email', user[0].email, { maxAge: 1 });
					console.log('expires set');
				}else{
					//keep session info indefinately
					console.log('expires not set');
				}
				********************************************************/
				res.json({ success: success, sessionObj: sessionObj });
				console.log('successful login');
			}else{
				success = false;
				res.json({ success: success, msg: 2});
			}
		}else{
			success = false;
			res.json({ success: success, msg: 1});
		}
	});
};