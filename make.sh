#!/bin/sh

./compile.js -nc \
	--combine js/combined.js \
	--compile js/combined-min.js \
	--path js/libs \
	--main js/app \
	js/libs/require.js^
