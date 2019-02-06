#!/bin/bash
cd /var/www/railil
git fetch
git reset --hard HEAD
git pull
npm i
npm run build
service railil restart
