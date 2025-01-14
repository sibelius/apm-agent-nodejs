'use strict'

const os = require('os')

const { SelfReportingMetricsRegistry } = require('measured-reporting')

const MetricsReporter = require('./reporter')
const createRuntimeMetrics = require('./runtime')
const createSystemMetrics = process.platform === 'linux'
  ? require('./platforms/linux')
  : require('./platforms/generic')

class MetricsRegistry extends SelfReportingMetricsRegistry {
  constructor (agent, { reporterOptions, registryOptions } = {}) {
    const defaultReporterOptions = {
      defaultDimensions: {
        hostname: agent._conf.hostname || os.hostname(),
        env: agent._conf.environment || ''
      }
    }

    const options = Object.assign({}, defaultReporterOptions, reporterOptions)
    const reporter = new MetricsReporter(agent._transport, options)

    super(reporter, registryOptions)

    this._registry.collectors = []
    createSystemMetrics(this)
    createRuntimeMetrics(this)
  }

  registerCollector (collector) {
    this._registry.collectors.push(collector)
  }
}

module.exports = MetricsRegistry
