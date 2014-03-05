var mongoose = require('mongoose'),
  Schema = mongoose.Schema;

var UserSchema = new Schema({
  username: String,
  nickname: String,
  authCode: String,
  sessionKey: String
});

mongoose.model('User', UserSchema);
