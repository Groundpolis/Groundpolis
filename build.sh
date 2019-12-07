#!/bin/sh

if type yarn >> /dev/null; then
	echo "yarn is installed! using yarn."
	yarn
	NODE_ENV=production yarn build
else
	echo "yarn is not installed! using npm."
	npm i
	NODE_ENV=production npm run build
fi

test

if [ $? -eq 0 ]; then
	rm built.zip
	zip -r built.zip ./built
fi