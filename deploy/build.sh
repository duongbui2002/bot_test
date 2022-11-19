#!/bin/bash

APP_PATH=/home/monokaijs/apps/deploybot/
REPO_URL=git@gitlab.com:northstudio/botdev.git
DEPLOYMENT_BRANCH=main

# Pull code
if [ -d "$APP_PATH" ]
then
  cd "$APP_PATH"
else
  git clone "$REPO_URL" "$APP_PATH"
  cd "$APP_PATH"
fi
git checkout $DEPLOYMENT_BRANCH
git pull origin $DEPLOYMENT_BRANCH

# Build and deploy
yarn install

pm2 stop deploybot
export NODE_ENV=production && pm2 start pm2.config.json