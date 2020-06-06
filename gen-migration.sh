#!/bin/sh

if [ $# -ne 1 ]; then
	echo "usage: $0 <migration-name>"
	exit -1
fi

npx ts-node ./node_modules/typeorm/cli.js migration:generate -n $1
