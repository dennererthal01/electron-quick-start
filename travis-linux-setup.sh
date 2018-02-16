#!/bin/bash

set -xe

DOCKER_BUILDER_NAME='builder'
THIS_PATH=$(dirname $0)

if [ -n "$ARCH" ]; then DOCKER_IMAGE="$ARCH/$DOCKER_IMAGE"; fi

docker run --name $DOCKER_BUILDER_NAME -e LANG=C.UTF-8 -e TERM \
       -v $PWD:$PWD -w $PWD/$THIS_PATH -td $DOCKER_IMAGE

docker exec -i $DOCKER_BUILDER_NAME apt-get update -q
docker exec -i $DOCKER_BUILDER_NAME apt-get install -y snapcraft

sudo apt-get install --no-install-recommends -y icnsutils

sudo apt-get install libstdc++6

#allow 32-bit app creation on 64-bit machine
sudo apt-get install --no-install-recommends -y gcc-multilib g++-multilib

#add 32-bit arch (necessary for wine)
sudo dpkg --add-architecture i386
#get wine
wget -nc https://dl.winehq.org/wine-builds/Release.key
sudo apt-key add Release.key
sudo apt-add-repository https://dl.winehq.org/wine-builds/ubuntu/
#update
sudo apt-get update
#install wine
sudo apt-get install --install-recommends winehq-stable