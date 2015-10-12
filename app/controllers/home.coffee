express  = require 'express'
router = express.Router()
mongoose = require 'mongoose'
Call = mongoose.model 'Call'
request = require 'request'

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
        
router.get '/dataClean', (req, res, next) ->
    res.render 'dataClean',
        title: 'Bandi pubblici'
        tagline : 'Tutti i bandi pubblici italiani in un solo sito, gratis'

router.get '/crawler*', (req, res, next) ->
  url = req.protocol + '://' + req.host + ':5000' + (req.path.replace '/crawler' , '')
  console.log 'redirect to ' + url
  (request url ).pipe(res)

router.post '/crawler*', (req, res, next) ->
  url = req.protocol + '://' + req.host + ':5000' + (req.path.replace '/crawler' , '')
  console.log 'redirect POST to ' + url
  (request.post url , req.body ).pipe(res)
