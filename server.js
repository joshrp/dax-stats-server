var request = require('request'),
		restify = require('restify'),
		server = restify.createServer(),
		stats = {},
		feeds = require('./feeds'),
		config = require('./config'),
		deepExtend = require('deep-extend')


var buildDaxUrl = function (feed) {
	var baseUrl = config.baseDaxUrl;
	var replacements = {
		itemId: feed.id,
		params: [],
		site: config.site,
		eventFilterId: (feed.eventfilterid ? ('&eventfilterid='+feed.eventFilter) : ''),
		password: config.password,
		username: config.username,
		startDate: 'yesterday',
		endDate: 'yesterday'
	}
	Object.keys(feed.params).forEach(function (k) {
		replacements.params.push(k + ':' + feed.params[k]);
	})
	replacements.params = replacements.params.join('|');

	Object.keys(replacements).forEach(function (k) {
		baseUrl = baseUrl.replace('{' + k + '}', replacements[k]);
	});

	return baseUrl + '';
}

var expandedFeeds = [];

feeds.forEach(function (feed) {
	if (!feed.vary) {
		expandedFeeds.push(feed);
		return
	}

	feed.vary.forEach(function (args) {
		var newFeed = deepExtend({}, feed);
		args.forEach(function (arg, i) {
			var replacement = new RegExp('\\{\\$' + (i+1) + '\\}', 'gi');
			newFeed.name = newFeed.name.replace(replacement, arg).replace(/_+/g, '-');
			for (param in newFeed.params) {
				newFeed.params[param] = newFeed.params[param].replace(replacement, arg);
			}
		})
		expandedFeeds.push(newFeed);
	});
});

expandedFeeds.forEach(function (feed) {
	stats[feed.name] = false;
	var url = buildDaxUrl(feed);

	console.log('fetching:"'+url+'"\n ')
	var timeStart = new Date().getTime();

	request(url, function (err, resp, body) {
		if (err) {
		 	throw err;
		}
		if (resp.statusCode !== 200) {
			err = JSON.parse(body);
			msg = ''
			if (err && err.ERROR)
				msg = err.ERROR;
			throw new Error('Error fetching data for ' + feed.name + ' using ' + url  + '. Code: '+resp.statusCode+'. Message: '+msg);
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
		res.json(stats[name]);
	}
});

server.listen(9615, function() {
  console.log('%s listening at %s', server.name, server.url);
});

