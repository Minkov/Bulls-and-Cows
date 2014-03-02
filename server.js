var express = require("express");
var mongoose = require('mongoose');

mongoose.connect("mongodb://localhost/bullsandcows");

var app = express();

app.use(express.bodyParser());

var db = mongoose.connection;

db.on("error", function(err){
	console.log(JSON.stringify(err));
});

db.once("open", function callback(){
	console.log("connection openned");
});

var gameSchema = mongoose.Schema({
	name: String
});

var Game = mongoose.model("Game", gameSchema);

var game = new Game({name: "Battle of Endor"});

console.log(game.name);

app.get("/", function(req, res){
	Game.find(function(err, games){
		res.json(games);
	});
});

app.post("/", function(req, res){
	if(!req.body.hasOwnProperty('name')) {
    res.statusCode = 400;
    return res.send('Error 400: Game syntax incorrect.');
  }

  var game = new Game({name: req.body.name});
  game.save(function(err, game){
  	if(err){
  		return console.error(err);
  	}
  	console.log("Successfully saved " + game.name);
  	res.json(true);
  });
});

app.listen(8080);