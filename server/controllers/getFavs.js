var express = require('express');
var router = express.Router();
var db = require('../models/index');

var favData = {};


router.get('/', function(req, res){
	console.log(req.body);
	console.log("Line9 getFavs.js");
	db.Drinks.find({
		_id : {
			$in : req.body.id
		}
	}, function(err, data){
		if(err) console.log(err);
		favData.drinks = data;
		res.send(favData);
	});
})

module.exports = router;