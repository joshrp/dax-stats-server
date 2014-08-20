#!/bin/bash
dest=/usr/lib/iplayer-dax-stats/configuration.json
cp -r /etc/iplayer-dax-stats/component_configuration.json $dest
chmod 777 $dest
