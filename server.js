var express = require("express");
var bodyParser = require("body-parser")
var db = require("./models");
var app = express();
var PORT = process.env.PORT || 8080;
app.use(express.static('public'));
app.use(bodyParser.json({limit: '50mb'}));
app.use(bodyParser.urlencoded({limit: '50mb', extended: true}));
var db = require('./models')
var htmlRoutes = require('./controllers/html-routes.js')(app)
var apiRoutes = require('./controllers/api-routes.js')(app)

db.sequelize.sync({force: true }).then(function(){
    app.listen(PORT, function(){
        console.log("Server listening on port", PORT)
    });
});