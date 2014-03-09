module.exports = function (app) {
    /* user routes */

    var user = require('../app/controllers/user');
    app.post('/user/register', user.register);

    app.post('/user/login', user.login);

    app.get('/user/logout/:sessionKey', user.logout);

    app.get('/user/scores', user.scores);

    app.get('/user/remove', user.removeAll);

    /* game routes */

    var games = require('../app/controllers/games');
    app.get('/games/open/:sessionKey', games.getOpen);
    app.get('/games/my-active/:sessionKey', games.getMyActive);

    app.post('/games/create/:sessionKey', games.create);
    app.put('/games/:id/join/:sessionKey', games.join);

    app.put('/games/:id/start/:sessionKey', games.start);
    app.get('/games/:id/remove', games.remove);
    app.get('/games/:id/leave/:sessionKey', games.leave);

    app.get('/games/all', games.getAll);
    app.get('/games/createSample', games.createSample);
    app.get('/games/createSampleActive', games.createSampleActive);
    app.get('/games/createSampleFull/:sessionKey', games.createSampleFull);
    app.get('/games/remove', games.removeAll);

    /* battle routes */

    var battle = require('../app/controllers/battle');
    app.get('/battle/all', battle.getAll);
    app.post('/battle/:id/attack/:sessionKey', battle.attack);

    app.get('/battle/:id/change-turn/:sessionKey', battle.changeTurnToMe);

    app.get('/battle/remove-all', battle.removeAll);
};