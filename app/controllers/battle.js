var mongoose = require('mongoose'),
	Game = mongoose.model('Game'),
	User = mongoose.model('User'),
	Field = mongoose.model('Field'),
	Unit = mongoose.model('Unit');


exports.getAll = function(req, res) {
	Field.find().exec()
		.then(function(fields) {
			res.json(fields);
		});
};

exports.attack = function(res, req) {};

exports.defend = function(res, req) {

};

exports.move = function(res, req){

};

/* test methods */

exports.removeAll = function(req, res) {
	Field.find().exec()
		.then(function(fields) {
			for (var i = 0; i < fields.length; i += 1) {
				fields[i].remove();
			}
		});
};