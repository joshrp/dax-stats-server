var request = require('request'),
	restify = require('restify'),
	server = restify.createServer(),
	stats = {},
	config = require('config'),
	Feeds = require('./Feeds'),
	startDate, endDate,
	moment = require('moment')

startDate = endDate = moment('2014-10-21');

feeds = new Feeds(startDate)

feeds.getAll().forEach(function (feed) {
	stats[feed.name] = false;

	var timeStart = new Date().getTime();

	request(feed.url, function (err, resp, body) {
		if (err) {
		 	throw err;
		}
		if (resp.statusCode !== 200) {
			err = JSON.parse(body);
			msg = ''
			if (err && err.ERROR)
				msg = err.ERROR;
			throw new Error('Error fetching data for ' + feed.name + ' using ' + feed.url  + '. Code: '+resp.statusCode+'. Message: '+msg);
		}
		stats[feed.name] = JSON.parse(body).reportitems.reportitem[0].rows.r;
		var timeEnd = new Date().getTime();
		console.log('Fetched',feed.name, 'in', timeEnd-timeStart+'ms')
	});
})

server.use(restify.CORS({
    credentials: true
}));

server.get('/stats/:name', function (req, res, next) {
	var name = req.params.name;

	if (!(name in stats)) {
		res.send(404);
	} else if (stats[name] === false) {
		res.send(204);
	} else {
		res.json({
			stats: stats[name],
			date: startDate.format('X')
		});
	}
});

server.get('/status', function (req, res) {
	var filled = {};

	for (var feed in stats) {
		filled[feed] = {
			fecthed: stats[feed].length > 0,
			href: 'https://' + req.headers['x-forwarded-host'] + '/stats/' + feed,
		}
	}

	res.json({
		date: startDate.format('X'),
		feeds: filled
	});
})

server.listen(config.port, function() {
  console.log('%s listening at %s', server.name, server.url);
});

