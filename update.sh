#!/bin/bash
cd /var/www/railil
git fetch
git pull
npm i
service railil restart
