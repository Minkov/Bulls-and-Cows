
var mongoose = require('mongoose'),
	Game = mongoose.model('Game'),
	User = mongoose.model('User');

exports.getOpen = function(req, res){
	if(!req.params.sessionKey){
		res.status(400);
		return res.json({message: 'missing session key'});
	}
	User.find({sessionKey: req.params.sessionKey}).exec()
		.then(function(users){
			if(!users.length){
				res.status(400);
				return res.json({message: 'invalid session key'});
			}
			return Game.find({state: "open"}).exec();
		})	
		.then(function(games){
				res.json(games);
		});
}

exports.getMyActive = function(req, res){
	if(!req.params.sessionKey){
		res.status(400);
		return res.json({message: 'missing session key'});
	}
	var userId;
	User.find({sessionKey: req.params.sessionKey}).exec()
		.then(function(users){
			if(!users.length){
				res.status(400);
				return res.json({message: 'invalid session key'});
			}
			userId = users[0].get('id');
			return Game.find({
				state: "active"}).exec();
		})
		.then(function(games){
				var myGames = [];
				for(var i = 0; i< games.length; i+=1){
					if(games[i].red === userId ||
						 games[i].blue === userId){
						myGames.push(games[i]);
					}
				}
				res.json(myGames);
		});
}

exports.create = function(req, res){
	if(!req.params.sessionKey){
		res.status(400);
		return res.json({message: 'missing session key'});
	}
	if(!req.body.hasOwnProperty('title')){
		res.status(400);
		return res.json({message: 'missing game title'});
	}
	var userId;
	User.find({sessionKey: req.params.sessionKey}).exec()
		.then(function(users){
			if(!users.length){
				res.status(400);
				return res.json({message: 'invalid session key'});
			}
			userId= users[0].get('id');
			var game = new Game({
				title: req.body.title,
				password: (req.body.hasOwnProperty('password'))? req.body.password : '',
				state: 'open',
				red: userId,
				blue: ''
			});
			return game.save();
		})
		.then(function(){
			res.json(true);
		});
}


exports.removeAll = function(req, res){
	Game.find(function(err, games){
			for(var i = 0; i< games.length; i+=1){
			var gameId = games[i].get("id");
			games[i].remove();
		}
		res.json(true);
	});
}

exports.getAll = function(req, res){
	Game.find().exec()
		.then(function(games){
			res.json(games);
		});
}

exports.createSample = function(req, res){
	var redPlayer = ((Math.floor(Math.random() * 1000)) % 2)? '53172eb7324632e340000001': 'Other',
			bluePlayer = (redPlayer === '53172eb7324632e340000001') ? "Other": '53172eb7324632e340000001',
			game = new Game({
			  title: 'Open: Battle of the Titans #' + Math.floor(Math.random() * 10000),
			  password: '',
			  state: 'open',
			  red: redPlayer,
			  blue: bluePlayer
			});
	game.save(function(){
		res.json(true);
	});
}

exports.createSampleActive = function(req, res){	
	var redPlayer = ((Math.floor(Math.random() * 1000)) % 2)? '53172eb7324632e340000001': 'Other',
			bluePlayer = (redPlayer === '53172eb7324632e340000001') ? "Other": '53172eb7324632e340000001',
			game = new Game({
			  title: 'Active: Battle of the Titans #' + Math.floor(Math.random() * 10000),
			  password: '',
			  state: 'active',
			  red: redPlayer,
			  blue: bluePlayer
			});
	game.save(function(){
		res.json(true);
	});
}
