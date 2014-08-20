#!/bin/bash
dest=/usr/lib/iplayer-dax-stats/configuration.json
sudo cp -r /etc/iplayer-dax-stats/component_configuration.json $dest
sudo chmod 777 $dest