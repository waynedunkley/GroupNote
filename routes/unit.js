var db = require("../db");

exports.index = function(req, res){

	//login test
	if(!req.session.user_id){
		req.session = {};
		res.render('login');
	}else if(req.param('name') == null){
		//no unit parameter found
		res.redirect('');
	}else{
		var unitname;
		// get course name if passed in url
		if(req.param('name')){
			var unitname = req.param('name');
		//check session
		}else if( req.session.unit !== undefined ){
			var unitname = req.session.unit;
		}else{
			res.redirect('');
		}
		
		//set session data
		req.session.unit = unitname;
		
		console.log(req.session.university);
		console.log(unitname);
		
		//check unit exists
		db.units.findOne({ university: req.session.university, unit: unitname }, function(err, result, count){
			
			if(result == null){
				//unit doesn't exist
				res.redirect('');
			}else{
				
				var now = Math.round(new Date().getTime()/1000)+3600;
				
				//Sets class status - countdown, live, finished, pending
				function addStatus(x){
					if(x < result.classes.length){
					
						//each much be parsed this way else javascript
						//will render them as text when adding them together
						
						var start = result.classes[x].unixdata.starttime - 0;
						var behind = result.classes[x].unixdata.starttime - 3600;
						var duration = result.classes[x].unixdata.duration - 0;
						var ahead = result.classes[x].unixdata.starttime - 0 + 3600;
						var extend = result.classes[x].unixdata.extended - 0;
						var end = start + duration + extend - 0;
						
						if(now < start && now > behind){
							result.classes[x].status = "starting soon";
							addStatus(x+1);
						}else if(now > start && now < ahead ){
							result.classes[x].status = "live";
							addStatus(x+1);
						}else if(now > end){
							result.classes[x].status = "complete";
							addStatus(x+1);
						}else{
							result.classes[x].status = "pending";
							addStatus(x+1);
						}
						
					}else{
						console.log(result.classes);
						res.render('unit', { user_id: req.session.user_id, username: req.session.username, uni: result.university, unitname: result.unit, classes: result.classes , date: now });
					}
				}
				
				//prevents error if no classes have not yet been created
				if(result.classes == undefined){
					res.render('unit', { username: req.session.username, uni: result.university, unitname: result.unit, classes: result.classes , date: now });
				}else{
					addStatus(0);
				}
			}
		});
	}
};

/*========================= ADD CLASS ===================================*/
/*=======================================================================*/

exports.addclass = function(req, res){
	
	var newClass = {};
	newClass.classname = req.body.className;
	newClass.unit = req.body.unit;
	newClass.lecturer = req.body.lecturer;
	newClass.date = req.body.date;
	newClass.time = req.body.time;
	newClass.duration = req.body.duration;
	
	newClass.unixdata = {};
	newClass.unixdata.starttime = parseInt(req.body.unixstarttime);
	newClass.unixdata.duration = parseInt(req.body.unixduration);
	newClass.unixdata.endtime = parseInt(req.body.unixstarttime) + parseInt(req.body.unixduration) - 0;
	newClass.unixdata.extended = 0;
	
	var uni = req.session.university;
	var unit = req.body.unit;
	
	console.log(uni);
	
	//check unit doesn't already exist
	db.units.find({ university: uni, unit: unit, classes: { $elemMatch: { classname: newClass.classname } } }, function(err, obj){
		if(obj == ""){
		
			//check for conflicting classes
			db.units.find({ university: uni, unit: unit },{ classes: 1 }, function(err, cl){
				function checkAval(i, length){
					if(i < length){
						console.log('check' + i);
						if(newClass.unixdata.starttime > cl[0].classes[i].unixdata.starttime && newClass.unixdata.starttime < cl[0].classes[i].unixdata.endtime){
							console.log("class conflicts with " + cl[0].classes[i].classname);
							res.json({ success: false, msg: "Class conflicts with " + cl[0].classes[i].classname });
						
						}else if(newClass.unixdata.endtime > cl[0].classes[i].unixdata.starttime && newClass.unixdata.endtime < cl[0].classes[i].unixdata.endtime){
							console.log("class conflicts with " + cl[0].classes[i].classname);
							res.json({ success: false, msg: "Class conflicts with " + cl[0].classes[i].classname });
						}else{
							i += 1;
							if(i == length){
								db.units.update({ university: uni, unit: unit }, { $push: { 'classes': newClass } }, function(err, saved){
									console.log('New class saved');
									res.json({ success: true, newClass: newClass });
								});							
							}else{
								checkAval(i, length);
							}
						}
					}		
				};					
				if(!cl[0].classes){
					console.log('no classes yet');
					db.units.update({ university: uni, unit: unit }, { $push: { 'classes': newClass } }, function(err, saved){
						console.log('New class saved');
						res.json({ success: true, newClass: newClass });
					});
				}else{
					
					checkAval(0, cl[0].classes.length);
				}
				
			});
		}else{
			//class exists, don't save, return false
			console.log("already exists");
			res.json({ success: false, msg: "Class already exists" });
		}
	});
};

/*=================== ADD COMMENT =======================================*/
/*=======================================================================*/

exports.addcomment = function(obj, user, callback){

	var variable = 'classes.' + obj.id + '.comments';
	var action = {};
	action[variable] = { comment: obj.comment, author: user.user_id, timestamp: obj.timestamp, unit: obj.unit, course: obj.course, uni: obj.uni }; 
	
	
	db.units.update({ university: user.uni, unit: user.unit }, { $push: action }, function(err, saved){
		if(err){
			console.log(err);
		}
		callback({ success: "success", obj: obj, user: user });
	});
};

/*=================== GET LIVE FEED DATA ================================*/
/*=======================================================================*/

exports.getFeed = function(feedId, user, callback){
	
	db.units.find({ university: user.uni, unit: user.unit }, function(err, result){
		callback({ cl: result[0].classes[feedId] });
	});
};

/*=================== GET COMPLETED CLASS DATA ==========================*/
/*=======================================================================*/

exports.getCompletedClasses = function(user, callback){
	
	db.units.find({ university: user.uni, unit: user.unit }, function(err, result){
		callback(result);
	});
	
}
