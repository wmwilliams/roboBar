var mongoose = require('mongoose');

var reportSchema = new mongoose.Schema({
	user: String,
  drink: String,
  date: {type : Date, default : Date.now}
});

var report_list = mongoose.model('report_list', reportSchema)

module.exports = report_list;
