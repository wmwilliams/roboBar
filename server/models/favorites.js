var mongoose = require('mongoose');

var favoriteSchema = new mongoose.Schema({
	user: String,
  drink: Object
});

var favorite_list = mongoose.model('favorite_list', favoriteSchema)

module.exports = favorite_list;
