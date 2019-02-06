#!/bin/bash
cd /var/www/railil
git fetch
git pull
npm i
npm run build
service railil restart
