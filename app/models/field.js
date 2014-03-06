var mongoose = require('mongoose'),
	Schema = mongoose.Schema;

var FieldSchema = new Schema({
	gameTitle: String,
	gameId: String,
	inTurn: String,
	red: {
		id: String,
		units: []
	},
	blue: {
		id: String,
		units:[]
	}
});

mongoose.model('Field', FieldSchema);