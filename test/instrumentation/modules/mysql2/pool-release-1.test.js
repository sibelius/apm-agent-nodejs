/*
 * Copyright Elasticsearch B.V. and other contributors where applicable.
 * Licensed under the BSD 2-Clause License; you may not use this file except in
 * compliance with the BSD 2-Clause License.
 */

'use strict'

var agent = require('../../../..').start({
  serviceName: 'test',
  secretToken: 'test',
  captureExceptions: false,
  metricsInterval: 0,
  centralConfig: false
})

var mysql = require('mysql2')
var test = require('tape')

var utils = require('./_utils')

test('release connection prior to transaction', function (t) {
  createPool(function (pool) {
    pool.getConnection(function (err, conn) {
      t.error(err)
      conn.release() // important to release connection before starting the transaction

      agent.startTransaction('foo')
      t.ok(agent.currentTransaction)

      pool.getConnection(function (err, conn) {
        t.error(err)
        t.ok(agent.currentTransaction)
        pool.end()
        t.end()
      })
    })
  })
})

function createPool (cb) {
  setup(function () {
    cb(mysql.createPool(utils.credentials()))
  })
}

function setup (cb) {
  utils.reset(cb)
}
