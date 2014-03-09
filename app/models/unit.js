var mongoose = require('mongoose'),
    Schema = mongoose.Schema;

var UnitSchema = new Schema({
    type: String,
    attack: Number,
    armor: Number,
    range: Number,
    speed: Number,
    life: Number,
    x: Number,
    y: Number,
    mode: String
});

mongoose.model('Unit', UnitSchema);