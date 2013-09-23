/*
 * file.js: Web storage engine for nconf files
 *
 * (C) 2011, Nodejitsu Inc.
 *
 */

var
  util = require('util'),
  http = require('http'),
  url = require('url'),
  formats = require('../formats'),
  Memory = require('./memory').Memory;

//
// ### function File (options)
// #### @options {Object} Options for this instance
// Constructor function for the File nconf store, a simple abstraction
// around the Memory store that can persist configuration to disk.
//
var Web = exports.Web = function (options) {
  if (!options || !options.web) {
    throw new Error('Missing required option `web`');
  }

  Memory.call(this, options);

  this.type = 'web';
  this.web = options.web;
  //this.dir    = options.dir    || process.cwd();
  this.format = options.format || formats.json;
  this.json_spacing = options.json_spacing || 2;
};

// Inherit from the Memory store
util.inherits(Web, Memory);

//
// ### function save (value, callback)
// #### @value {Object} _Ignored_ Left here for consistency
// #### @callback {function} Continuation to respond to when complete.
// Saves the current configuration object to disk at `this.web`
// using the format specified by `this.format`.
//
Web.prototype.save = function (value, callback) {
  if (!callback) {
    callback = value;
    value = null;
  }

  fs.writeFile(this.file, this.format.stringify(this.store, null, this.json_spacing), function (err) {
    return err ? callback(err) : callback();
  });
};

//
// ### function saveSync (value, callback)
// #### @value {Object} _Ignored_ Left here for consistency
// #### @callback {function} **Optional** Continuation to respond to when complete.
// Saves the current configuration object to disk at `this.web`
// using the format specified by `this.format` synchronously.
//
Web.prototype.saveSync = function (value) {
  try {
    fs.writeFileSync(this.file, this.format.stringify(this.store, null, this.json_spacing));
  }
  catch (ex) {
    throw(ex);
  }
  return this.store;
};

//
// ### function load (callback)
// #### @callback {function} Continuation to respond to when complete.
// Responds with an Object representing all keys associated in this instance.
//
Web.prototype.load = function (callback) {
  var self = this;

  var data;
  var parsed = url.parse(this.web);
  var options = {
    host: parsed.hostname,
    port: parsed.port,
    path: parsed.path,
    method: 'GET',
    headers: {
      'Content-Type': 'application/json'
    }
  };

  http.request(options,function (res) {
    if (res.statusCode != 200) {
      return callback(new Error("Error fetching url from: [" + self.web + '"], statusCode: ["' + res.statusCode + '"].'));
    }
    res.on('data', function (chunk) {
      data += chunk;
    });
    res.on('end', function (err) {
      if (err)
        return callback(new Error("Error fetching url from: [" + self.web + '"], error: ["' + err + '"].'));

      self.store = data;
      return callback(null, self.store);
    })
  }).end();
};

//
// ### function loadSync (callback)
// Attempts to load the data stored in `this.web` synchronously
// and responds appropriately.
//
Web.prototype.loadSync = function () {
  var data, self = this;

  if (!existsSync(self.file)) {
    self.store = {};
    data = {};
  }
  else {
    //
    // Else, the path exists, read it from disk
    //
    try {
      data = this.format.parse(fs.readFileSync(this.file, 'utf8'));
      this.store = data;
    }
    catch (ex) {
      throw new Error("Error parsing your JSON configuration file: [" + self.file + '].');
    }
  }

  return data;
};