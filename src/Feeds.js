var deepExtend = require('deep-extend'),
	daxDateFormat = 'YYYYMMDD',
	config = require('config');

function Feeds (startDate) {
	var that = this;
	that.feeds = [];
	that.startDate = this.endDate = startDate
	rawFeedConfig = require('./feedConfig');
	this.feedConfig = []

	rawFeedConfig.forEach(function (feed) {
		if (feed.vary) {
			that.feedConfig = that.feedConfig.concat(Feeds.varyConfig(feed))
		} else {
			that.feedConfig.push(feed);
		}
	});

	this.feeds = that.feedConfig.map(function (feed) {
		return {
			name: feed.name,
			url: that.buildUrl(feed)
		}
	});
}

Feeds.varyConfig = function (feed) {
	var newFeeds = [];
	feed.vary.forEach(function (args) {
		var newFeed = deepExtend({}, feed);
		delete newFeed['vary'];
		args.forEach(function (arg, i) {
			var replacement = new RegExp('\\{\\$' + (i+1) + '\\}', 'gi');
			newFeed.name = newFeed.name.replace(replacement, arg).replace(/_+/g, '-');
			for (param in newFeed.params) {
				newFeed.params[param] = newFeed.params[param].replace(replacement, arg);
			}
		})
		newFeeds.push(newFeed);
	});

	return newFeeds;
}

Feeds.prototype.buildUrl = function (feed) {
	var baseUrl = config.baseDaxUrl;
	var replacements = {
		itemId: feed.id,
		params: [],
		site: config.site,
		eventFilterId: (feed.eventfilterid ? ('&eventfilterid='+feed.eventFilter) : ''),
		password: config.password,
		username: config.username,
		startDate: feed.startDate || this.startDate.format(daxDateFormat),
		endDate: feed.endDate || this.endDate.format(daxDateFormat),
		rowCount: feed.rowCount || 5000
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


Feeds.prototype.getAll = function () {
	return this.feeds;
}

module.exports = Feeds;
