var request = require('request')

function Stats (feeds) {
	var that = this;
	that.stored = {};

	feeds.forEach(function (feed) {
		that.stored[feed.name] = false;

		var timeStart = new Date().getTime();

		request(feed.url, function (err, resp, body) {
			var msg, respErr;
			if (err) {
			 	throw err;
			}
			respErr = JSON.parse(body);
			if (resp.statusCode === 400 && respErr && respErr.ERROR && respErr.ERROR === 'No data') {
				that.stored[feed.name] = [];
			} else if (resp.statusCode === 200)  {
				that.stored[feed.name] = JSON.parse(body).reportitems.reportitem[0].rows.r;
			} else {
				msg = ''
				if (respErr && respErr.ERROR)
					msg = respErr.ERROR;
				console.error('Error fetching data for ' + feed.name + ' using ' + feed.url  + '. Code: '+resp.statusCode+'. Message: '+msg);
				return;
			}
			var timeEnd = new Date().getTime();
			console.log('Fetched',feed.name, 'in', timeEnd-timeStart+'ms')
		});
	});
}

Stats.prototype.getStats = function (name) {
	if (!(name in this.stored)) {
		return Stats.NOT_FOUND;

	} else if (this.stored[name] === false) {
		return Stats.NOT_READY;

	} else if (this.stored[name].length === 0) {
		return Stats.NO_DATA;

	} else {
		return this.stored[name];
	}
}

Stats.NOT_FOUND = '404';
Stats.NOT_READY = 'not ready yet';
Stats.NO_DATA = 'no data';

module.exports = Stats;