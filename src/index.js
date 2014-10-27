var request = require('request'),
	restify = require('restify'),
	server = restify.createServer(),
	stats = {},
	config = require('config'),
	Feeds = require('./Feeds'),
	currentStatsDate,
	moment = require('moment')

currentStatsDate = moment('2014-10-28');

feeds = new Feeds(currentStatsDate)

feeds.getAll().forEach(function (feed) {
	stats[feed.name] = false;

	var timeStart = new Date().getTime();

	request(feed.url, function (err, resp, body) {
		var msg, respErr;
		if (err) {
		 	throw err;
		}
		respErr = JSON.parse(body);
		if (resp.statusCode === 400 && respErr && respErr.ERROR && respErr.ERROR === 'No data') {
			stats[feed.name] = [];
		} else if (resp.statusCode !== 200)  {
			msg = ''
			if (respErr && respErr.ERROR)
				msg = respErr.ERROR;
			throw new Error('Error fetching data for ' + feed.name + ' using ' + feed.url  + '. Code: '+resp.statusCode+'. Message: '+msg);
		} else {
			stats[feed.name] = JSON.parse(body).reportitems.reportitem[0].rows.r;
		}
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
		// No idea what this is
		res.send(404);
	} else if (stats[name] === false) {
		// Stats not fetched yet
		res.send(202);
	} else if (stats[name].length === 0) {
		// No stats available
		res.send(204);
	} else {
		res.json({
			stats: stats[name],
			date: currentStatsDate.format('X')
		});
	}
});

server.get('/status', function (req, res) {
	var filled = {};

	for (var feed in stats) {
		filled[feed] = {
			fecthed: stats[feed] !== false,
			hasData: stats[feed].length > 0,
			href: 'https://' + req.headers['x-forwarded-host'] + '/stats/' + feed,
		}
	}

	res.json({
		date: currentStatsDate.format('X'),
		feeds: filled
	});
})

server.listen(config.port, function() {
  console.log('%s listening at %s', server.name, server.url);
});

