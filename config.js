/**
 * APP CONFIGURATION
 */
 
module.exports = function(app, express, path, view){
	app.set('views', __dirname + '/views');
	app.set('view engine', 'jade');
	app.use(express.favicon());
	app.use(express.logger('dev'));
	app.use(express.bodyParser());
	app.use(express.methodOverride());
	app.use(express.cookieParser('your secret here'));
	app.use(express.cookieSession());
	app.use(app.router);
/* 	app.use(require('stylus').middleware(__dirname + '/public')); */
	app.use(express.static(path.join(__dirname, 'public')));
}