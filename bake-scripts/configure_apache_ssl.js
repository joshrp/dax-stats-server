#!/usr/bin/env node

var fs = require('fs'),
	confFile = '/etc/httpd/conf.d/iplayer-dax-stats_ssl_termination.conf',
	certRegex = /^SSLCertificateFile\s.*$/gim,
	keyRegex = /^SSLCertificateKeyFile\s.*$/gim,
	config = fs.readFileSync(confFile, 'utf-8')


config = config.replace(certRegex, 'SSLCertificateFile /etc/pki/tls/private/dax-stats.iplayer.cloud.bbc.co.uk.crt');
config = config.replace(keyRegex, 'SSLCertificateKeyFile /etc/pki/tls/private/dax-stats.iplayer.cloud.bbc.co.uk.key');

fs.writeFileSync(confFile, config);