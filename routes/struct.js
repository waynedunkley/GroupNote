var db = require("../db");



/*== CREATE COURSE ==
 ====================*/
exports.createcrs = function(req, res){
	var crs = req.body.name;
	var uni = req.session.university;
	
	//check course doesn't already exist
	db.uni.find({ university: uni, course: crs}, function(err, course){
		if(course == ""){
			console.log("its free");
			//add course to database
			db.uni.save({ university: uni, course: crs }, function(err, saved){
				console.log('course saved');
				res.json({ success: true, newcrs: crs });	
			})
		}else{
			console.log("already exists");
			res.json({ success: false });
		}
	})
}


/*== CREATE UNIT ==
 ===================*/
exports.createunit = function(req, res){
	var unit = req.body.name;
	var crs = req.session.course;
	var uni = req.session.university;
		
	//check unit doesn't already exist
	db.units.find({ university: uni, unit: unit}, function(err, u){
		if(u == ""){
			// Create unit document in the classes collection
			db.units.save({ university: uni, unit: unit }, function(err, saved){
				console.log('class document created');
			});
		};
			
		db.uni.find({ university: uni, course: crs, units: unit}, function(err, un){
			if(un == ""){
				//add unit to course document
				db.uni.update({ university: uni, course: crs }, { $push: { 'units': unit } }, function(err, saved){
					console.log('course saved');
					res.json({ success: true , newunit: unit });
				})
			}else{
				console.log("already exists");
				res.json({ success: false });
			}
		})
	})
};