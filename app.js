/**
 * Electron Dependencies
 */

var appAtomShell = require('app');  // Module to control application life.
var BrowserWindow = require('browser-window');  // Module to create native browser window.


/**
 * Webapp Dependencies
 */

var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var morgan = require('morgan');
var Faker = require('faker');

var config = require('./config.json');

var app = express();

app.use(favicon(__dirname + '/public/favicon.ico'));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());

app.use('/', express.static(path.join(__dirname, 'public')));


/**
 * Dummy Data setup
 */

var userData = [];

for (i = 0; i < 20; i++) {
  userData.push({
    name: Faker.name.firstName() + ' ' + Faker.name.lastName(),
    id: Faker.random.uuid(),
    philosophy: Faker.hacker.phrase()
  });
}

var fakeData = [{
  name: 'Gregory',
  age: 26,
  gender: 'male',
  id: 1
}, {
  name: 'Mini',
  age: 24,
  gender: 'female',
  id: 2
}];


/**
 * Dummy Routes
 */

app.get('/users', function(req, res) {
  res.json(fakeData)
});

app.post('/users/new', function(req, res) {
  fakeData.push(req.body);
  res.json(fakeData);
});


/**
 * Application Port setup
 */

app.listen(config.port, function() {
  console.info('app server is listening on port 7777');
});


/**
 * Electron Config
 */

// Report crashes to our server.
require('crash-reporter').start();

// Keep a global reference of the window object, if you don't, the window will
// be closed automatically when the javascript object is GCed.
var mainWindow = null;

// Quit when all windows are closed.
appAtomShell.on('window-all-closed', function() {
  if (process.platform != 'darwin')
    appAtomShell.quit();
});

// This method will be called when Electron has done everything
// initialization and ready for creating browser windows.
appAtomShell.on('ready', function() {
  console.log('READY is called');
  // Create the browser window.
  mainWindow = new BrowserWindow({width: 1400, height: 900, fullScreen: true, 'node-integration': false});

  // and load the index.html of the app.
  mainWindow.loadUrl('http://localhost:' + config.port);

  // Emitted when the window is closed.
  mainWindow.on('closed', function() {
    // Dereference the window object, usually you would store windows
    // in an array if your app supports multi windows, this is the time
    // when you should delete the corresponding element.
    mainWindow = null;
  });
});
