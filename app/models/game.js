var mongoose = require('mongoose'),
  Schema = mongoose.Schema;

var GameSchema = new Schema({
  title: String,
  password: String,
  state: String,
  red: String,
  blue: String
});

mongoose.model('Game', GameSchema);
