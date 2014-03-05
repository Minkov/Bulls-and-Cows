'use strict';

var mongoose = require('mongoose'),
	User = mongoose.model('User');

if(!String.prototype.insertAt){
	String.prototype.insertAt = function(index, str) {
		if(index===0){
			return str + this;
		}
		return this.substr(0, index) + str + this.substr(index, this.length - index);
	};
}

function generateSessionKey(){
	var sessionKeyLength = 50,
			sessionKeyChars = 'qwertyuiopasdfghjklzxcvbnm0987654123',
			sessionKey = [],
			i,
			insertIndex,
			char;
			while(sessionKey.length <= 50){
				char = sessionKeyChars[Math.floor(Math.random() * sessionKeyChars.length)];
				insertIndex = Math.floor(Math.random()*sessionKey.length);
				sessionKey.splice(insertIndex, 0, char);
			}
			return sessionKey.join('');
}

exports.register = function(req, res){
	if(!req.body.hasOwnProperty('username') ||
		!req.body.hasOwnProperty('nickname') ||
		!req.body.hasOwnProperty('authCode')){
		res.status(400);
		return res.json({message: 'missing user data'});
	}
	var user = new User({
		username: req.body.username,
		nickname: req.body.nickname,
		authCode: req.body.authCode
	});

  User.find().exec()
  	.then(function(users){
			for(var i = 0; i < users.length; i+=1){
				if(users[i].username === user.username){
					res.status(400);
					return res.json({ message: "duplicated username",
														errCode: "ERR_DUP_USR"});
				} 
				else if(users[i].nickname === user.nickname){
					res.status(400);
					return res.json({ message: "duplicated nickname",
														errCode: "ERR_DUP_NICK"});
				};
			}
			return user.save();
		})
		.then(function(dbUser){
			console.log('User created!');
			res.status(201);
			res.json(true);
		})
};

exports.login = function(req, res){
	if(!req.body.hasOwnProperty('username') ||
		!req.body.hasOwnProperty('authCode')){
		res.status(400);
		return res.json({message: 'missing user data'});
	}

	var user = new User({
		username: req.body.username,
		authCode: req.body.authCode
	}),
		dbUser;

  User.find().exec()
  	.then(function(users){
			for(var i = 0; i < users.length; i+=1){
				if(users[i].username === user.username){
					dbUser = users[i];
					break;
				}
			}
			if(!dbUser || dbUser.authCode !== user.authCode){
				res.status(404);
				return res.json({message: 'Invalid user credentials'});
			}

			return User.update({_id: dbUser.get('id')}, {sessionKey: generateSessionKey()}).exec();
		})
		.then(function(){
			return User.findById(dbUser.get('id')).exec();
		})
		.then(function(user){
			res.json({
				nickname: user.get('nickname'),
				sessionKey: user.get('sessionKey')
			});
		});
};

exports.logout = function(req, res){
	if(!req.params.sessionKey){
		res.status(400);
		return res.json({message: 'missing sessionKey'});
	}
	User.find().exec()
		.then(function(users){
			console.log(req.params.sessionKey);
			for(var i = 0; i < users.length; i+=1){
				if(users[i].get('sessionKey') && users[i].get('sessionKey') === req.params.sessionKey){
					return User.update({_id: users[i].get('id')}, {sessionKey:''}).exec();
				}
			}
		})
		.then(function(){
			console.log('User logged out');
			res.json(true);
		});
}

exports.scores = function(req, res){
	User.find().exec()
		.then(function(users){
			res.json(users);
		});
}

exports.removeAll = function(req, res){
	User.find().exec()
		.then(function(users){
			console.log(users);
			for(var i = 0; i< users.length; i+=1){
				var userId = users[i].get("id");
				users[i].remove()
					.then(function(){
						console.log("User with id: " + userId + " was successfully deleted");
					});
			}
		}, function(err){
			res.json(err);
		});
}