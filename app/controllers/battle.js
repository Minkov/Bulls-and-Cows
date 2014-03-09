var mongoose = require('mongoose'),
    Game = mongoose.model('Game'),
    User = mongoose.model('User'),
    Field = mongoose.model('Field'),
    Unit = mongoose.model('Unit');

function checkForProperties(obj, props) {
    'use strict';
    var i;
    for (i = 0; i < props.length; i += 1) {
        if (!obj.hasOwnProperty(props[i])) {
            return false;
        }
    }
    return true;
}

function buildErrResponse(res, message, statusCode, errCode) {
    'use strict';
    var errResponse = {
        message: message,
        errCode: errCode
    };
    console.log(errResponse);
    res.status(statusCode);
    return res.json(errResponse);
}

exports.getAll = function (req, res) {
    'use strict';
    Field.find().exec()
        .then(function (fields) {
            res.json(fields);
        });
};

exports.attack = function (req, res) {
    'use strict';
    var sessionKey,
        position,
        unitId,
        fieldId,
        userId,
        dbField,
        user,
        attackingUnit,
        defendingUnit;
    if (!checkForProperties(req.params, ['sessionKey'])) {
        return buildErrResponse(res, 'Missing user sessionKey', 400, 'ERR_MISS_SESS');
    }
    if (!checkForProperties(req.params, ['id'])) {
        return buildErrResponse(res, 'Invalid battle id', 400, 'ERR_INV_BATL');
    }
    if (!checkForProperties(req.body, ['position', 'unitId']) || !checkForProperties(req.body.position, ['x', 'y'])) {
        return buildErrResponse(res, 'Invalid attack details', 400, 'ERR_INV_ATK');
    }
    position = req.body.position;
    unitId = req.body.unitId;
    fieldId = req.params.id;
    sessionKey = req.params.sessionKey;

    User.find({
        sessionKey: sessionKey
    }).exec()
        .then(function (users) {
            if (!users || !users.length) {
                return buildErrResponse(res, 'Invalid user authentication', 404, 'INV_USR_AUTH');
            }
            userId = users[0].get('id');
            return Field.find({
                '_id': fieldId
            }).exec();
        })
        .then(function (fields) {
            var field;
            if (!fields || !fields.length) {
                return buildErrResponse(res, 'Invalid field', 400, 'ERR_INV_FLD');
            }
            field = fields[0];
            if (field.get('red').id !== userId && field.get('blue').id !== userId) {
                return buildErrResponse(res, 'User not in the battle', 400, 'ERR_INV_BATL');
            }
            user = (field.get('red').id === userId) ? 'red' : 'blue';
            if (field.inTurn !== user) {
                return buildErrResponse(res, 'User not in turn', 400, 'ERR_INV_TURN');
            }
            dbField = field;
            return Game.findById(field.get('gameId')).exec();
        })
        .then(function (game) {
            if (!game || game.state !== 'active') {
                return buildErrResponse(res, 'Game is either finished or not started yet', 404, 'INV_GAME_STATE');
            }
            return dbField;
        })
        .then(function (field) {
            var i,
                units = field[user].units,
                damageTaken,
                defendingUser;
            for (i = 0; i < units.length; i += 1) {
                if (units[i]._id == unitId && units[i].life > 0) {
                    attackingUnit = units[i];
                    break;
                }
            }
            if (!attackingUnit) {
                return buildErrResponse(res, 'No such live unit in the battle', 400, 'ERR_INV_UNIT');
            }
            defendingUser = (user === 'red') ? 'blue' : 'red';
            units = field[defendingUser].units;
            for (i = 0; i < units.length; i += 1) {
                if (units[i].life > 0 && units[i].x === position.x && units[i].y === position.y) {
                    defendingUnit = units[i];
                    break;
                }
            }
            if (!defendingUnit) {
                return buildErrResponse(res, 'No live unit available on this position', 400, 'INV_ATK_POS');
            }
            damageTaken = attackingUnit.attack - defendingUnit.armor;
            if (defendingUnit.mode === 'defend') {
                damageTaken -= defendingUnit.armor;
            }
            // defendingUnit.life -= damageTaken;
            field[defendingUser].units[i].life -= damageTaken;
            console.log(field[defendingUser].units[i]);

            return Field.findByIdAndUpdate(field.get('id'), {
                red: field.red,
                blue: field.blue
            });
        })
        .then(function () {
            res.json(true);
        }, function (err) {
            res.status(400);
            res.json(arguments);
        });
};

exports.changeTurnToMe = function (req, res) {
    'use strict';
    var user;
    User.find({
        sessionKey: req.params.sessionKey
    }).exec()
        .then(function (users) {
            user = users[0];
            return Field.find({
                '_id': req.params.id
            }).exec();
        })
        .then(function (fields) {
            var userType;
            if (!fields || !fields.length) {
                return buildErrResponse(res, 'No such battle', 400, 'ERR_INV_BATL');
            }
            userType = (fields[0].get('red').id === user.get('id')) ? 'red' : 'blue';
            return Field.update({
                _id: fields[0].get('id')
            }, {
                inTurn: userType
            }).exec();
        })
        .then(function () {
            console.log('User updated');
            res.json(true);
        });
}

// exports.defend = function (req, res) {

// };

// exports.move = function (req, res) {

// };

/* test methods */

exports.removeAll = function (req, res) {
    'use strict';
    Field.find().exec()
        .then(function (fields) {
            var i;
            for (i = 0; i < fields.length; i += 1) {
                fields[i].remove();
            }
        });
};