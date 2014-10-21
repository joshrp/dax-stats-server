#!/usr/bin/env node
var fs = require('fs'),
	exec = require('child_process').exec;
    config = JSON.parse(fs.readFileSync(process.argv[2], {encoding: 'utf-8'}));

function writeCert(cert) {
	var certPath = '/etc/pki/tls/private/dax-stats.iplayer.cloud.bbc.co.uk.crt';
	cert = new Buffer(cert, 'base64').toString('ascii');
	writeFile(certPath, cert);
}

function writeKey(key) {
	var keyPath = '/etc/pki/tls/private/dax-stats.iplayer.cloud.bbc.co.uk.key';
	key = new Buffer(key, 'base64').toString('ascii');
	writeFile(keyPath, key);
}

function writeFile (file, contents) {
	fs.writeFileSync(file, contents);
	exec('chmod 744 ' + file);
	exec('chown iplayer-dax-stats ' + file);
}


if (typeof config.secure_configuration.sslCertificate !== 'string') {
    throw new Error('Could not read certificate from config. Property "sslCertificate" not set.')
}
if (typeof config.secure_configuration.sslKey !== 'string') {
    throw new Error('Could not read key from config. Property "sslKey" is empty.')
}

writeKey(config.secure_configuration.sslKey);
writeCert(config.secure_configuration.sslCertificate);

config.secure_configuration.sslKey = null
config.secure_configuration.sslCertificate = null

newConfigPath = '/usr/lib/iplayer-dax-stats/configuration.json'

writeFile(newConfigPath, JSON.stringify(config));

