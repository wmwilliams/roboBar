var mongoose = require('mongoose');

var liquidSchema = new mongoose.Schema({
	name: String,
  volume: Number
});

var liquid_list = mongoose.model('liquid_list', liquidSchema)

module.exports = liquid_list;
