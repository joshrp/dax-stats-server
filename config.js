baseConfig = {
	baseDaxUrl: 'https://sitestatapi.com/v1/reportitems.xml?nrofrows=1000&itemid={itemId}&site={site}&startdate={startDate}&enddate={endDate}&client=bbc&user={username}&password={password}&format=json&parameters={params}&eventfilterid={eventFilterId}',
	password: '',
	username: ''
}
args = process.argv.slice(2);

baseConfig.username = process.env.DAX_USERNAME;
if (!baseConfig.username) {
	console.error('No DAX username given. Set $DAX_USERNAME');
	process.exit(1)
}

baseConfig.password = process.env.DAX_PASSWORD;
if (!baseConfig.password) {
	console.error('No DAX password given. Set $DAX_PASSWORD');
	process.exit(1)
}

baseConfig.site = process.env.DAX_SITE;
if (!baseConfig.site) {
	console.error('No DAX site given. Set $DAX_SITE');
	process.exit(1)
}

module.exports = baseConfig;