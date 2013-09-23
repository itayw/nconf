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
        this.store = store = new nconf.Web({ web: 'http://localhost:40001/conf/joola.io.sdk' });
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
    }
  }
}).export(module);

