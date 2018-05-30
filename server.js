var express = require("express");
var bodyParser = require("body-parser")
var db = require("./models");
var app = express();
var PORT = process.env.PORT || 8080;
app.use(express.static('public'));
app.use(bodyParser.urlencoded({extended: true}));
app.use(bodyParser.json());
var db = require('./models')
//var routes = require('./controllers/burgers_controller.js')(app)

db.sequelize.sync({force: true }).then(function(){
    app.listen(PORT, function(){
        console.log("Server listening on port", PORT)
    });
});