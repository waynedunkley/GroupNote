var db = require("../db");

exports.index = function(req, res){

	//login test
	if(!req.session.user_id){
		req.session = {};
		res.render('login');
	}else{
		var crs;
		// get course name if passed in url
		if(req.param('name')){
			crs = req.param('name');
		//check session
		}else if( req.session.course !== undefined ){
			crs = req.session.course;
		}else{
			res.redirect('');
		}
		//check course exists, if it does, assign to session and pass details to jade file
		db.uni.findOne({ university: req.session.university, course: crs }, function(err, result){
			if(result !== null){
				//set users course
				db.users.update({ username: req.session.username }, { $set: { course: result.course }}, function(err, check){
					req.session.course = crs;
					res.render('units', { username: req.session.username, uni: req.session.university, units: result.units, course: result.course });
				});	
			}else{
				//if it doesn't exist redirect to homepage
				res.redirect('');
			}
		})
	}
};