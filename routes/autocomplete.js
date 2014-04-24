var db = require("../db");

exports.units = function(req, res){
	var query = req.param('query');
	var uni = req.session.university;
	var list = new Array;
	
	// Go get all the units for that Uni and store in list Array
	db.units.find({ university: uni }, function(err, units){
		
		console.log(units.length);

		for(x=0; x < units.length; x++){
			var c = {};
			c.value = units[x].unit;
			list.push(c);
		};
		res.json(list);
	});

};
exports.lecturers = function(req, res){
	var query = req.param('query');
	var uni = req.session.university;
	var list = new Array;
	var uniquelist = new Array;
	
	// Go get all the lecturers for that Uni
	db.units.find({ university: uni }, { "classes.lecturer": 1 }, function(err, obj){
		
		//gets all lecturer names from obj, store in list
		for(var x=0; x < obj.length; x++){
			if(obj[x].classes){
				for(var i = 0; i < obj[x].classes.length; i++){
					list.push(obj[x].classes[i].lecturer);
				}
			}
		}
		
		//remove duplicates
		var uniquelist = list.filter(function(elem, pos) {
		    return list.indexOf(elem) == pos;
		})
		
		//send list back to client
		res.json(uniquelist);		
	});

};
