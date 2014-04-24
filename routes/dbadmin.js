var db = require("../db");

//List Users
exports.listusers = function(req, res){
	db.users.find(function(err, users) {
		if( err || !users) console.log(err);
		else if ( users == 0) console.log("There are no users");
		else users.forEach(function(user){
			console.log(user);
		});
	});
	res.send("Users listed in terminal");
};

//List Courses
exports.listcourses = function(req, res){
	db.uni.find(function(err, unis) {
		if( err || !unis) console.log(err);
		else if ( unis == 0) console.log("There are no uni's");
		else unis.forEach(function(uni){
			console.log(uni);
		});
	});
	res.send("Uni's are listed in terminal");
};

//List Units
exports.listunits = function(req, res){
	db.units.find(function(err, classes) {
		if( err || !classes) console.log(err);
		else if ( classes == 0) console.log("There are no units");
		else classes.forEach(function(cl){
			console.log(cl);
			//console.log(cl.classes[0].comments);
		});
	});
	res.send("units are listed in terminal");
};

//Delete Users
exports.deleteusers = function(req, res){
	db.users.remove({}); 
	res.send("All users deleted");
};

//Delete Courses
exports.deletecourses = function(req, res){
	db.units.remove({});
	db.uni.remove({});
	res.send("All University's and Units deleted");
};

//Delete Units
exports.deleteunits = function(req, res){
	db.units.remove({}); 
	res.send("All units deleted")
};

//Show session user
exports.sessionuser = function(req, res){
	console.log(req.session);
	res.send("session user in terminal");
};

