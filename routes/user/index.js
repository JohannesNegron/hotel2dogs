var express = require( 'express' );
var router  = express.Router();

router.get('/user/:name', function( req, res ) {
	console.log( 'user/' +req.params.name);
	if(!(req.session.user == false || req.session.user === undefined)){
		res.render( 'user/' + req.params.name, { name : req.session.name } );
	}else{
		res.render('user/login.jade');
	}
});

router.get('*', function(req, res){
	if(req.session.user == false || req.session.user === undefined){
		res.render('user/index.user.jade');
	}else{
		res.render('user/index.login.jade', { name : req.session.name } );
	};
});

module.exports = router;
