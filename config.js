mainConfig = {
    baseDaxUrl: 'https://sitestatapi.com/v1/reportitems.xml?nrofrows=5000&itemid={itemId}&site={site}&startdate={startDate}&enddate={endDate}&client=bbc&user={username}&password={password}&format=json&parameters={params}{eventFilterId}',
    password: '',
    username: ''
}

args = process.argv.slice(2);
grabConfig = function (componentConfigPath) {
    fs = require('fs')

    componentConfig = require(componentConfigPath)

    mainConfig.username = componentConfig.secure_configuration.username
    if (!mainConfig.username) {
        console.error('No DAX username given.');
        process.exit(1)
    }

    mainConfig.password = componentConfig.secure_configuration.password;
    if (!mainConfig.password) {
        console.error('No DAX password given.');
        process.exit(1)
    }

    mainConfig.site = componentConfig.secure_configuration.site;
    if (!mainConfig.site) {
        console.error('No DAX site given.');
        process.exit(1)
    }

    return mainConfig
}

module.exports = {
    getConfig: function () {
        return grabConfig('./configuration.json')
    },
}