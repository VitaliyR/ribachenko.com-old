#!/bin/bash

GIT_STATUS=$(git pull)

if [[ "${GIT_STATUS}" != *"Already up"* ]]
then
  NODE_ENV=production node ./node_modules/.bin/gulp
fi
