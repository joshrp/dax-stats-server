var restify = require('restify'),
	server = restify.createServer(),
	config = require('config'),
	Feeds = require('./Feeds'),
	Stats = require('./Stats'),
	moment = require('moment'),
	currentStatsDate = moment('2014-10-26');

feeds = new Feeds(currentStatsDate).getAll()
var stats = new Stats(feeds);

server.use(restify.CORS({
    credentials: true
}));

server.get('/stats/:name', function (req, res, next) {
	var name = req.params.name;
	var data = stats.getStats(name);
	if (data === Stats.NOT_FOUND) {
		// No idea what this is
		res.send(404);
	} else if (data === Stats.NOT_READY) {
		// Stats not fetched yet
		res.send(202);
	} else if (data === Stats.NO_DATA) {
		// No stats available
		res.send(204);
	} else {
		res.json({
			stats: data,
			date: currentStatsDate.format('X')
		});
	}
});

server.get('/status', function (req, res) {
	var filled = {};

	feeds.forEach(function (feed) {
		data = stats.getStats(feed.name);

		filled[feed.name] = {
			fecthed: data !== Stats.NOT_READY,
			hasData: data !== Stats.NO_DATA,
			href: 'https://' + req.headers['x-forwarded-host'] + '/stats/' + feed.name,
		}
	});

	res.json({
		date: currentStatsDate.format('X'),
		feeds: filled
	});
})

server.listen(config.port, function() {
  console.log('%s listening at %s', server.name, server.url);
});

