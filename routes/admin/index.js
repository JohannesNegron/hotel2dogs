var express = require( 'express' );
var router  = express.Router();

router.get('/admin/:name', function( req, res ) {
	console.log( 'admin/' +req.params.name);
	if(!(req.session.admin == false || req.session.admin === undefined)){
		res.render( 'admin/' + req.params.name, { title : 'Prolum' } );
	}else{
		res.render('admin/login.jade');
	}
});

router.get('*', function( req, res ) {
	if(req.session.admin == false || req.session.admin === undefined){
		res.render('admin/index.admin.jade');
	}else{
		res.render('admin/index.login.jade');
	};
});

module.exports = router;
