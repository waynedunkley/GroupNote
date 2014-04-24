/* =======================================================
	To run app,
	in terminal run 
	$mongod <-- run this from anywhere
	$nodemon app.js <-- run from groupnote home, 
 								run in seperate terminal window
  =========================================================*/

/**	SETUP		**************************************************/

var port = 1337;

var express = require('express')
	, app = require('express')()
	, server = require('http').createServer(app)
	, io = require('socket.io').listen(server)
	, http = require('http')
	, path = require('path')
	, pdf = require('pdfcrowd');
  
var index = require('./routes/index')
	, dbadmin = require('./routes/dbadmin')
	, crs = require('./routes/course')
	, unit = require('./routes/unit')
	, documentviewer = require('./routes/documentviewer')
	, ac = require('./routes/autocomplete')
	, struct = require('./routes/struct');
	
var pdfclient = new pdf.Pdfcrowd('wdunkley84', '187a89c9fe6e18275b9b1c1691e305f3');

require('./config')(app,express, path);
server.listen(port);
console.log('Listening on port ' + port);





/**	ROUTES	**************************************************/


//ROUTES - GET PAGES
app.get('/', index.home);
app.get('/course', crs.index);
app.get('/unit', unit.index);
app.get('/documentviewer', documentviewer.index);
app.post('/register', index.register_post);
app.get('/register', function (req, res){
	//if user already logged in redirected to homepage
	if(req.session.username){
		res.redirect('/');
	}else{
		res.render('register');
	}
});
app.post('/login', index.login_post);
app.get('/login', function (req, res){
	//if user already logged in redirected to homepage
	if(req.session.user_id){
		res.redirect('/');
	}else{
		res.render('login');
	}
});

/*
app.post('/pdf', function(req, res){
	//console.log(req.body.doc);
	pdfclient.convertHtml(req.body.doc, pdf.sendHttpResponse(res));
});
*/

app.get('/logout', function (req, res) {
  req.session = {};
  res.redirect('/');
});

app.get('/getUserData', function (req, res){
	var obj = req.session;
	res.json({ data: obj });
});

//STRUCTURE SERVICES
app.post('/addcrs', struct.createcrs);
app.post('/addunit', struct.createunit);
app.post('/addclass', unit.addclass);




/**	ADMIN		***************************************************/

//ADMIN
app.get('/dblistusers', dbadmin.listusers);
app.get('/dblistcourses', dbadmin.listcourses);
app.get('/dblistunits', dbadmin.listunits);

app.get('/dbdeleteusers', dbadmin.deleteusers);
app.get('/dbdeletecourses', dbadmin.deletecourses);
app.get('/dbdeleteunits', dbadmin.deleteunits);
app.get('/dbsessionuser', dbadmin.sessionuser);

//ADMIN - LIST IN BROWSER
app.get('/ac_units', ac.units);
app.get('/ac_lecturers', ac.lecturers);




/**	SOCKETS	**************************************************/

//SOCKETS
io.sockets.on('connection', function(socket){
	console.log('sockets connected!');
	
	socket.on('adduser', function(obj){
		socket.set('userData', obj, function () {
	      console.log(obj + ' is ready');
	    });
	    
	});


	socket.on('addcomment', function(obj, user){

		unit.addcomment(obj, user, function(res){
			if(res.success == "failed"){
				console.log("There was an error saving comment");
			}else{
				io.sockets.emit('updatecomments', res.obj, res.user);
			};
		});
	});
	
	socket.on('updateFeed', function(feedId, user){
		unit.getFeed(feedId, user, function(cl){
			socket.emit('updateFeed', cl);
		});
	});
	
	socket.on('getCompletedClasses', function(user){
		unit.getCompletedClasses(user, function(list){
			socket.emit('getCompletedClasses', list);
		});
	});
	
	socket.on('getDocContents', function(user, doc_id){
		documentviewer.getDocContents(user, doc_id, function(contents){
			socket.emit('getDocContents', contents);
		});
	});
	
	socket.on('searchQuery', function(user, unit){
		documentviewer.search(user, unit, function(classes){
			socket.emit('searchQuery', classes);
		});
	});
	
	socket.on('update-class-menu', function(res){
		io.sockets.emit('addmenuitem', res);
	});
	
	socket.on('updatecrslist', function(newcrs){
		io.sockets.emit('updatecrslist', newcrs);
	});
	socket.on('updateunitlist', function(newunit){
		io.sockets.emit('updateunitlist', newunit);
	});
	
});



