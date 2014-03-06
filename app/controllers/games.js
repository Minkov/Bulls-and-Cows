var mongoose = require('mongoose'),
	Game = mongoose.model('Game'),
	User = mongoose.model('User'),
	Field = mongoose.model('Field'),
	Unit = mongoose.model('Unit');

function getUnit(type, position) {
	if (type === 'warrior') {
		return new Unit({
			type: 'warrior',
			attack: 12,
			armor: 5,
			range: 1,
			speed: 2,
			life: 15,
			x: position.x,
			y: position.y
		});
	} else if (type === 'archer') {
		return new Unit({
			type: 'archer',
			attack: 12,
			armor: 3,
			range: 3,
			speed: 1,
			life: 10,
			x: position.x,
			y: position.y
		});
	}
}

function prepareField(gameId, gameTitle, redPlayerId, bluePlayerId) {
	var unitPositions = {
		red: {
			archers: [{
				x: 1,
				y: 0
			}, {
				x: 3,
				y: 0
			}, {
				x: 5,
				y: 0
			}, {
				x: 7,
				y: 0
			}, ],
			warriors: [{
				x: 0,
				y: 1
			}, {
				x: 2,
				y: 1
			}, {
				x: 4,
				y: 1
			}, {
				x: 6,
				y: 1
			}, {
				x: 8,
				y: 1
			}]
		},
		blue: {
			archers: [{
				x: 1,
				y: 8
			}, {
				x: 3,
				y: 8
			}, {
				x: 5,
				y: 8
			}, {
				x: 7,
				y: 8
			}, ],
			warriors: [{
				x: 0,
				y: 7
			}, {
				x: 2,
				y: 7
			}, {
				x: 4,
				y: 7
			}, {
				x: 6,
				y: 7
			}, {
				x: 8,
				y: 7
			}]

		}
	}, i;

	var redUnits = [];
	var blueUnits = [];
	for (i = 0; i < unitPositions.red.archers.length; i += 1) {
		redUnits.push(getUnit('archer', unitPositions.red.archers[i]));
		blueUnits.push(getUnit('archer', unitPositions.blue.archers[i]));
	}

	for (i = 0; i < unitPositions.red.warriors.length; i += 1) {
		redUnits.push(getUnit('warrior', unitPositions.red.warriors[i]));
		blueUnits.push(getUnit('warrior', unitPositions.blue.warriors[i]));
	}

	var field = new Field({
		gameTitle: gameTitle,
		gameId: gameId,
		inTurn: (Math.floor(Math.random() * 10000) % 2) ? 'red' : 'blue',
		red: {
			id: redPlayerId,
			units: redUnits
		},
		blue: {
			id: bluePlayerId,
			units: blueUnits
		}
	});
	return field;
}

exports.getOpen = function(req, res) {
	if (!req.params.sessionKey) {
		res.status(400);
		return res.json({
			message: 'missing session key'
		});
	}
	User.find({
		sessionKey: req.params.sessionKey
	}).exec()
		.then(function(users) {
			if (!users.length) {
				res.status(400);
				return res.json({
					message: 'invalid session key'
				});
			}
			return Game.find({
				state: 'open'
			}).exec();
		})
		.then(function(games) {
			res.json(games);
		});
};

exports.getMyActive = function(req, res) {
	if (!req.params.sessionKey) {
		res.status(400);
		return res.json({
			message: 'missing session key'
		});
	}
	var userId;
	User.find({
		sessionKey: req.params.sessionKey
	}).exec()
		.then(function(users) {
			if (!users.length) {
				res.status(400);
				return res.json({
					message: 'invalid session key'
				});
			}
			userId = users[0].get('id');
			return Game.find({
				state: 'active'
			}).exec();
		})
		.then(function(games) {
			var myGames = [];
			for (var i = 0; i < games.length; i += 1) {
				if (games[i].red === userId ||
					games[i].blue === userId) {
					myGames.push(games[i]);
				}
			}
			res.json(myGames);
		});
};

exports.create = function(req, res) {
	if (!req.params.sessionKey) {
		res.status(400);
		return res.json({
			message: 'missing session key'
		});
	}
	if (!req.body.hasOwnProperty('title')) {
		res.status(400);
		return res.json({
			message: 'missing game title'
		});
	}
	var userId;
	User.find({
		sessionKey: req.params.sessionKey
	}).exec()
		.then(function(users) {
			if (!users.length) {
				res.status(400);
				return res.json({
					message: 'invalid session key'
				});
			}
			userId = users[0].get('id');
			return Game.find({
				title: req.body.title,
				state: 'open'
			}).exec();
		})
		.then(function(games) {
			if (games.length) {
				res.status(400);
				return res.json({
					message: 'Game already exists'
				});
			}
			var game = new Game({
				title: req.body.title,
				password: (req.body.hasOwnProperty('password')) ? req.body.password : '',
				state: 'open',
				red: userId,
				blue: ''
			});
			return game.save();
		})
		.then(function() {
			res.json(true);
		});
};

exports.join = function(req, res) {
	if (!req.params.sessionKey) {
		res.status(400);
		return res.json({
			message: 'missing session key'
		});
	}
	if (!req.params.id) {
		res.status(400);
		return res.json({
			message: 'missing game id'
		});
	}
	console.log('Endpoint reached');
	var gameId = req.params.id,
		sessionKey = req.params.sessionKey,
		userId;
	console.log('SessionKey received: ' + sessionKey);
	User.find({
		sessionKey: sessionKey
	}).exec()
		.then(function(users) {
			userId = users[0].get('id');
			console.log('User found');
			return Game.find({
				_id: gameId,
				state: 'open'
			}).exec();
		}, function(err) {
			res.json(err);
		})
		.then(function(games) {
			if (!games.length) {
				res.status(404);
				return res.json({
					message: 'game not found'
				});
			}
			console.log('Game found');
			var theGame = games[0];
			if (theGame.get('red') === userId) {
				res.status(400);
				return res.json({
					message: 'player cannot join a game they craeted'
				});
			}
			return Game.update({
				_id: theGame.get('id')
			}, {
				blue: userId,
				state: 'full'
			}).exec();
		})
		.then(function() {
			res.json(true);
		});
};

/* games/:id/start/:sessionKey */
exports.start = function(req, res) {
	console.log('Game to be started');
	if (!req.params.sessionKey) {
		res.status(400);
		return res.json({
			message: 'missing session key'
		});
	}
	if (!req.params.id) {
		res.status(400);
		return res.json({
			message: 'missing game id'
		});
	}
	var gameId = req.params.id,
		sessionKey = req.params.sessionKey,
		userId,
		redPlayerId,
		bluePlayerId,
		gameTitle;
	User.find({
		sessionKey: sessionKey
	}).exec()
		.then(function(users) {
			userId = users[0].get('id');
			return Game.find({
				_id: gameId,
				state: 'full'
			}).exec();
		}, function(err) {
			res.json(err);
		})
		.then(function(games) {
			if (!games.length) {
				res.status(404);
				return res.json({
					message: 'game not found'
				});
			}
			var theGame = games[0];
			if (theGame.get('red') !== userId) {
				res.status(400);
				return res.json({
					message: 'Only the creator can start a game'
				});
			}
			redPlayerId = theGame.get('red');
			bluePlayerId = theGame.get('blue');
			gameTitle = theGame.get('title');
			return Game.update({
				_id: theGame.get('id')
			}, {
				state: 'active'
			}).exec();
		})
		.then(function() {
			var field = prepareField(gameId, gameTitle, redPlayerId, bluePlayerId);
			console.log('Field generated:' + field);
			return field.save();
		})
		.then(function() {
			console.log("Field saved");
			res.json(true);
		});
};

exports.remove = function(req, res) {

};

exports.leave = function(req, res) {

};

/* for testing */

exports.removeAll = function(req, res) {
	Game.find(function(err, games) {
		for (var i = 0; i < games.length; i += 1) {
			var gameId = games[i].get('id');
			games[i].remove();
		}
		res.json(true);
	});
};

exports.getAll = function(req, res) {
	Game.find().exec()
		.then(function(games) {
			res.json(games);
		});
};

exports.createSampleFull = function(req, res) {
	var sessionKey = req.params.sessionKey;

	User.find({
		'sessionKey': sessionKey
	}).exec()
		.then(function(users) {
			var userId = users[0].get('id');
			var game = new Game({
				title: "Full: Sample Game " + Math.floor(Math.random() * 1999),
				red: userId,
				blue: "SAMPLE_USER",
				state: 'full',
				password: '',
			});
			return game.save(function(err,data) {
				console.log(data);
				res.json(data);
			});
		});
};

exports.createSample = function(req, res) {
	var redPlayer = ((Math.floor(Math.random() * 1000)) % 2) ? '53172eb7324632e340000001' : 'Other',
		bluePlayer = (redPlayer === '53172eb7324632e340000001') ? 'Other' : '53172eb7324632e340000001',
		game = new Game({
			title: 'Open: Battle of the Titans #' + Math.floor(Math.random() * 10000),
			password: '',
			state: 'open',
			red: redPlayer,
			blue: bluePlayer
		});
	game.save(function() {
		res.json(true);
	});
};

exports.createSampleActive = function(req, res) {
	var redPlayer = ((Math.floor(Math.random() * 1000)) % 2) ? '53172eb7324632e340000001' : 'Other',
		bluePlayer = (redPlayer === '53172eb7324632e340000001') ? 'Other' : '53172eb7324632e340000001',
		game = new Game({
			title: 'Active: Battle of the Titans #' + Math.floor(Math.random() * 10000),
			password: '',
			state: 'active',
			red: redPlayer,
			blue: bluePlayer
		});
	game.save(function() {
		res.json(true);
	});
};