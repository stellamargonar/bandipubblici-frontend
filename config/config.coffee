path     = require 'path'
rootPath = path.normalize __dirname + '/..'
env      = process.env.NODE_ENV || 'development'

config =
  development:
    root: rootPath
    app:
      name: 'calls-crawler'
    port: 3000
    db: 'mongodb://localhost/calls-crawler-development'

  test:
    root: rootPath
    app:
      name: 'calls-crawler'
    port: 3000
    db: 'mongodb://localhost/calls-crawler-test'

  production:
    root: rootPath
    app:
      name: 'calls-crawler'
    port: 3000
    db: 'mongodb://localhost/calls-crawler-production'

module.exports = config[env]
