var request = require('request'),
		restify = require('restify'),
		server = restify.createServer(),
		stats = {},
		feeds = require('./feeds'),
		config = require('./config')


var buildDaxUrl = function (feed) {
	var baseUrl = config.baseDaxUrl;
	var replacements = {
		itemId: feed.id,
		params: [],
		site: config.site,
		password: config.password,
		username: config.username,
		startDate: 'yesterday',
		endDate: 'yesterday',
		eventFilterId: feed.eventFilter
	}
	Object.keys(feed.params).forEach(function (k) {
		replacements.params.push(k + ':' + feed.params[k]);
	})
	replacements.params = replacements.params.join('|');

	Object.keys(replacements).forEach(function (k) {
		baseUrl = baseUrl.replace('{' + k + '}', replacements[k]);
	});

	return baseUrl;
}

feeds.forEach(function (feed) {
	stats[feed.name] = false;
	console.log('fetching:',buildDaxUrl(feed))
	request(buildDaxUrl(feed), function (err, resp, body) {
		if (err) {
		 	throw err;
		}
		if (resp.statusCode !== 200) {
			err = JSON.parse(body);
			msg = ''
			if (err && err.ERROR)
				msg = err.ERROR;
			throw new Error('Error fetching data. Code: '+resp.statusCode+'. Message: '+msg);
		}
		stats[feed.name] = JSON.parse(body).reportitems.reportitem[0].rows.r;
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
		res.json(stats[name]);
	}
});

server.listen(9615, function() {
  console.log('%s listening at %s', server.name, server.url);
});

