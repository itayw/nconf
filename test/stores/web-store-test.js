/*
 * file-store-test.js: Tests for the nconf File store.
 *
 * (C) 2011, Nodejitsu Inc.
 *
 */

var
    vows = require('vows'),
    assert = require('assert'),
    nconf = require('../../lib/nconf'),
    data = require('../fixtures/data').data,
    store;

vows.describe('nconf/stores/web').addBatch({
  "When using the nconf web store": {
    "with a valid JSON file": {
      topic: function () {
        this.store = store = new nconf.Web({ web: 'https://gist.github.com/itayw/6670060/raw/d5f060ebc8be7e8f612d894e7ae175ff165b7096/store.json' });
        return null;
      },
      "the load() method": {
        topic: function () {
          this.store.load(this.callback);
        },
        "should load the data correctly": function (err, data) {
          assert.isNull(err);
          assert.deepEqual(data, this.store.store);
        }
      }
    },
    "with a malformed JSON file": {
      topic: function () {
        this.store = store = new nconf.Web({ web: 'https://gist.github.com/itayw/6670060/raw/fffa15574b0370af6d99460438856e386a161cbb/malformed.json#' });
        return null;
      },
      "the load() method with a malformed JSON config file": {
        topic: function () {
          this.store.load(this.callback.bind(null, null));
        },
        "should respond with an error and indicate file name": function (_, err) {
          assert.isTrue(!!err);
          assert.match(err, /malformed\.json/);
        }
      }
    }
  }
}).export(module);

