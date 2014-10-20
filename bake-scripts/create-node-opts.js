#! /usr/bin/env node

// This script is passed the location of the cosmos configuration file at bake time.
// See https://confluence.dev.bbc.co.uk/display/platform/Environment+-+specific+service+configuration.

var fs = require('fs');
var config = require(process.argv[2]);
var sysConfigFile = '/etc/sysconfig/iplayer-dax-stats';
var nodeConfigDir = '/usr/lib/iplayer-dax-stats/config';

var nodeOpts = '--NODE_ENV=' + config.environment +
              ' --NODE_CONFIG_DIR=' + nodeConfigDir +
              ' --NODE_CONFIG="{\\"version\\": \\"' + config.release + '\\"}"';
var sysConfig = 'NODE_OPTS=\'' + nodeOpts + '\'';

fs.writeFileSync(sysConfigFile, sysConfig);