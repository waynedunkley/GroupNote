var db = require("../db");

exports.index = function(req, res){

	//login test
	if(!req.session.user_id){
		req.session = {};
		res.render('login');
	}else{
		
		var doc_id;
		var user = {};
		user.username = req.session.username;
		user.uni = req.session.university;
		user.course = req.session.course;
		user.unit = req.session.unit;
		
		// get doc id if passed in url
		if(req.param('doc_id')){
			doc_id = req.param('doc_id');
		//check session
		}
		
		var back = req.headers.referer;
		
		if(doc_id){ //its a referal from a class page
			res.render('documentviewer', { username: req.session.username, id: doc_id, unit: req.session.unit, back: back });
			
		}else{ //its a document viewer link
			db.uni.findOne({ university: user.uni, course: user.course }, function(err, result){
				console.log(result.units);
				res.render('documentviewer', { username: req.session.username, id: doc_id, units: result.units, back: back });
			});
		}
		

		
	}
};

exports.getDocContents = function(user, doc_id, res){

	db.units.findOne({ university: user.uni, unit: user.unit }, function(err, result){
		if(result){
			if(result.classes[doc_id] != undefined){
				res(result.classes[doc_id].comments);
			}else{
				res({});
			}	
		}else{
			res({});
		}
	});

};

exports.search = function(user, unit, res){
	db.units.find({ university: user.uni, unit: unit }, { classes: 1 }, function(err, result){
		
		if(result[0].classes != undefined){
			res(result[0].classes);
		}else{
			res({});
		}
		
	});
}











