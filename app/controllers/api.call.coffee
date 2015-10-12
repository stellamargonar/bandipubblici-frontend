express  = require 'express'
router = express.Router()
mongoose = require 'mongoose'
url = require 'url'
Call = mongoose.model 'Call'

deleteEmpty = (obj) ->
  newobj = {}
  for i,v of obj
    if v
      newobj[i] = v
  return newobj

module.exports = (app) ->
  app.use '/api/', router

router.get '/call', (req, res, next) ->
  query = deleteEmpty req.query
  query.expirationDate = {$gt: new Date()}
  console.log(query);
  Call.find(query).sort('expiration').limit(25).exec (err, calls) ->
    return next(err) if err
    res.json(calls) 

router.post '/call', (req, res, next) ->
  call = new Call(req.body);
  call.save (err) ->
    if err 
      return res.status(400).send(err)
    res.status(200).json(call);

router.get '/call/:id', (req, res, next) ->
  Call.findOne {_id : req.params.id}, (err, call) ->
    return next(err) if err
    res.json(call) 

router.post '/call/:id', (req, res, next) ->
  Call.findOneAndUpdate {_id: req.body._id}, req.body, (err, call) ->
    if err
      return res.status(400).send(err)
    res.status(200).json(call);

router.delete '/call/:id', (req, res, next) ->
  Call.findByIdAndRemove req.params.id, (err) ->
    return next(err) if err
    res.status(200).json()

router.get '/institutions', (req, res, next) ->
  Call.find().distinct 'institution', (err, institutions) ->
    return next(err) if err
    institutions.sort()
    res.status(200).json(institutions)

router.get '/cities', (req, res, next) ->
  Call.find().distinct 'city', (err, institutions) ->
    return next(err) if err
    res.status(200).json(institutions)

router.get '/types', (req, res, next) ->
  Call.find().distinct 'type', (err, types) ->
    return next(err) if err
    res.status(200).json(types)