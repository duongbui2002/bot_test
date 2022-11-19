#!/bin/bash

SSH_SERVER="volta.northstudio.dev"

echo "Deploying to ${SSH_SERVER}"
ssh monokaijs@${SSH_SERVER} 'bash' < ./deploy/build.sh