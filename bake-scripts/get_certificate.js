#!/usr/bin/env node
var fs = require('fs'),
    config = JSON.parse(fs.readFileSync(process.argv[2], {encoding: 'utf-8'}));

if (typeof config.secure_configuration.sslCertificate !== 'string') {
    throw new Error('Could not read certificate from config. Property "sslCertificate" not set.')
}
if (typeof config.secure_configuration.sslKey !== 'string') {
    throw new Error('Could not read key from config. Property "sslKey" is empty.')
}

cert = new Buffer(config.secure_configuration.sslCertificate, 'base64').toString('ascii');
key = new Buffer(config.secure_configuration.sslKey, 'base64').toString('ascii');
config.secure_configuration.sslKey = null
config.secure_configuration.sslCertificate = null

certPath = '/etc/pki/tls/certs/service.crt';
keyPath = '/etc/pki/tls/certs/service.key';

fs.writeFileSync(certPath, cert);
fs.writeFileSync(keyPath, key);

exec = require('child_process').exec;
exec('chown iplayer-dax-stats ' + certPath);
exec('chown iplayer-dax-stats ' + keyPath);
exec('chmod 700 ' + certPath);
exec('chmod 700 ' + keyPath);

newConfigPath = '/usr/lib/iplayer-dax-stats/configuration.json'
fs.writeFileSync(newConfigPath, JSON.stringify(config));
exec('chmod 777 ' + newConfigPath);