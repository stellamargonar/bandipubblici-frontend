express  = require 'express'
router = express.Router()
mongoose = require 'mongoose'
Call = mongoose.model 'Call'

module.exports = (app) ->
  app.use '/', router

router.get '/', (req, res, next) ->
    res.render 'index',
        title: 'Bandi pubblici'
        tagline : 'Tutti i bandi pubblici italiani in un solo sito, gratis'

router.get '/crud', (req, res, next) ->
    res.render 'crud',
        title: 'Bandi pubblici'
        tagline : 'Tutti i bandi pubblici italiani in un solo sito, gratis'

router.get '/bandi', (req, res, next) ->
  Call.find (err, calls) ->
    return next(err) if err
    res.render 'calls',
      title: 'Bandi pubblici'
      tagline : 'Tutti i bandi pubblici italiani in un solo sito, gratis'
      calls : calls

router.get '/sources', (req, res, next) ->
    res.render 'sources',
        title: 'Bandi pubblici'
        tagline : 'Tutti i bandi pubblici italiani in un solo sito, gratis'