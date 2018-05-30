var db = require('../models');
var path = require("path");

module.exports = function(app){
    app.get('/scanner', function(req, res){
        res.sendFile(path.join(__dirname, "../public/scanner.html"));
    })
}