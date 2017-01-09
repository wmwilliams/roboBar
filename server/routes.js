var path         = require('path');
var app          = require('express');

module.exports = {
'/getAll' : require('./controllers/getData'),
'/getFavs' : require('./controllers/getFavs'),
  '/' : function(req, res){
    res.sendFile(path.join(__dirname, '../client/index.html'));
  }
};