#!/bin/sh

date

rm ./built/client/assets/*

npm run build && npm run debug

date
