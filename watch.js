#! /usr/bin/env node

var dirs = ['js'];
var exclude = /combined/;
var include = /\.js$/;
var files = [];
var cmd = './make.sh';
var verbose = false;



var fs = require("fs"),
	exec = require('child_process').exec,
	watching = {},
	initialDone = false;



function scanDirs(initial) {
	if (!initial) initialDone = true;
	dirs.forEach(readDir);
}

function readDir(dir) {
	fs.readdir(dir, function(err, dirFiles) {
		dirFiles.forEach(function(file) {
			var path = dir + '/' + file;
			if (watching[path] || file.charAt(0) == '.' || (exclude && exclude.test(path))) return;
			
			if (file.indexOf('.') != -1) {
				// assume is file
				if (!include || include.test(path)) watchFile(path);
				
			} else {
				
				// check if directory
				fs.stat(path, function(err, stats) {
					if (stats.isDirectory()) {
						readDir(path);
					} else {
						watchFile(path);
						if (initialDone) triggerAction();
					}
				});
			}
		});
	});
}

function watchFile(path) {
	if (verbose) console.log('watching:', path);
	// set up watch
	watching[path] = true;
	fs.watchFile(path, {interval: 1000}, onWatchFile.bind(null, path));
}


var running = false, queue = false;
function onWatchFile(file, curr, prev) {
	if (curr.mtime.getTime() != prev.mtime.getTime()) {
		if (running) return queue = true;
		if (verbose) console.log('delay of compiling after save:', new Date().getTime() - curr.mtime.getTime(), 'ms')
		triggerAction();
	}
}

function triggerAction() {
	running = true;
	console.log('running ' + cmd);
	var time = new Date().getTime();
	exec(cmd, function(error, stdout, stderr) {
		if (stderr) console.log(stderr);
		if (verbose) console.log('finished', cmd, 'in', Math.round( (new Date().getTime() - time)/10 )/100, 'seconds');
		else console.log('done!', '(' + Math.round( (new Date().getTime() - time)/10 )/100, 'seconds)');
		running = false;
		if (queue) {
			queue = false;
			triggerAction(); 
		}
	});
}


// watch initial files and scan directories
files.forEach(watchFile);

scanDirs(true);

setInterval(scanDirs, 5000);