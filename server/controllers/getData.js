var express = require('express');
var router = express.Router();
var db = require('../models/index');

var totalData = {};


router.get('/', function(req, res){
	db.Drinks.find({}, function(err, data){
		if(err) console.log(err);
		totalData.drinks = data;
		res.send(totalData);
	});
})

// router.route('/')
//   .get(function(req, res) {
//     db.Drinks.find(function(err, drink) {
//       if (err) return res.status(500).send(err);
//       console.log('DB-GET DRINKS');
//       totalData.drinks = data;
//       console.log(totalData.drinks + "DATA.DRINKS GETDATA CNTRL");
//       res.send(totalData);
//     });
//   })
//   .post(function(req, res) {
//     db.Drinks.create(req.body, function(err, drinks) {
//       if (err) return res.status(500).send(err);
//       console.log('DB-POST DRINKS');
//       res.send(drinks);
//     });
//   });

// router.get('/:id', function(req, res) {
//   db.Drinks.findById(req.params.id, function(err, drinks) {
//     if (err) return res.status(500).send(err);
//     res.send(drinks);
//   });
// });

module.exports = router;
