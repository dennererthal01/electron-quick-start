#!/bin/sh

# Let brew update
brew update;

DIR=$(dirname $0)

# Install / link brew libraries
for pkg in fontconfig freetype gd gmp gnutls jasper jpeg libgphoto2 libicns libpng libtasn1 libtiff libtool libusb libusb-compat little-cms2 nettle openssl sane-backends webp xz pkg-config makedepend imagemagick graphicsmagick wine mono cairo; do
    if [ $(ls -A /usr/local/Cellar/$pkg) ]; then
        brew unlink $pkg && brew link $pkg
    else
        brew install $pkg
    fi
done
