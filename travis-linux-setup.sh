#!/bin/bash

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