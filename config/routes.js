module.exports = function(app){


	/* user routes */

	var user = require('../app/controllers/user');
	app.post('/user/register', user.register);

	app.post('/user/login', user.login);

	app.get('/user/logout/:sessionKey', user.logout);

	app.get('/user/scores', user.scores);

	app.get('/user/remove', user.removeAll);

	/* game routes */

	var games = require('../app/controllers/games');
	app.post('/games/create/:sessionKey', games.create);
	app.get('/games/open/:sessionKey', games.getOpen);
	app.get('/games/my-active/:sessionKey', games.getMyActive);

	app.get('/games/all', games.getAll);

	app.get('/games/createSample', games.createSample);
	app.get('/games/createSampleActive', games.createSampleActive);
	app.get('/games/remove', games.removeAll);
};
