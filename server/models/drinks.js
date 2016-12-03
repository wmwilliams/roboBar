var mongoose = require('mongoose');

var drinkSchema = new mongoose.Schema({
	title: String,
	description: String,
	img: String,
	extra: String,
	ingredients: Object
});

var drink_list = mongoose.model('drink_list', drinkSchema)

module.exports = drink_list;