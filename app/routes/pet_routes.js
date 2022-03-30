// Import our dependencies, middleware and models
const express = require('express')
const passport = require('passport')

// Pull in our Pet model
const Pet = require('../models/pet')

// Helps us detect certain situations and send custom errors
const customErrors = require('../../lib/custom_errors')

// This function sends a 404 when non-existent document is requested
const handle404 = customErrors.handle404
// Middleware that can send a 401 when a user tries to access something they do not own - AUTHORIZATION
const requireOwnership = customErrors.requireOwnership
// requireToken is passed as a second arg to router.<verb> - AUTHORIZATION
// Makes it so that a token MUST be passed for that route to be available --> also sets 'req.user'
// We will not be using sessions, we will be using tokens
const requireToken = passport.authenticate('bearer', { session: false })
// This middleware removes any blank fields from req.body
const removeBlanks = require('../../lib/remove_blank_fields')

// Instantiate our router
const router = express.Router()

/******************** ROUTES *******************/

// INDEX -> GET /pets
router.get('/pets', (req, res, next) => {
    // We will allow access to view all the pets by skipping requireToken
    // If we wanted to make this a protected resource, we'd just need to add that middlewate as the second arugment to our get( like we did in CREATE)
    Pet.find()
        .populate('owner')
        .then( pets => {
            // Pets will be an array of Mongoose documents - these are stored in mongoDB as BSON
            // So we want to turn them into plain old JS objects (POJO) from BSON
            // map returns a new array
            return pets.map(pet => pet.toObject())
        })
        // Convert regular JS objects into JSON
        .then( pets => res.status(200).json({ pets: pets }) )
        .catch(next)
})

// SHOW -> GET /pets/624466855484cefd56290392
router.get('/pets/:id', requireToken, (req, res, next) => {
    // We get the id from req.params.id -> :id
    Pet.findById(req.params.id)
        .populate('owner')
        .then(handle404)
        // if its successful, respond with an object as json
        .then( pet => res.status(200).json({ pet: pet.toObject() }))
        // otherwise pass to error handler
        .catch(next)
})

// CREATE -> POST /pets
router.post('/pets', requireToken, (req, res, next) => {
    // We brought in requireToken, so we can have access to req.user
    // req.user is coming from requireToken where it is set up
    req.body.pet.owner = req.user.id

    Pet.create(req.body.pet)
        .then( pet => {
            // send a successful response like this
            res.status(201).json({ pet: pet.toObject() })
        })
        // if an error occurs, pass it to the error handler
        .catch(next)
})

// UPDATE -> PATCH /pets/624466855484cefd56290392
// removeBlanks removes blank fields from req.body
router.patch('/pets/:id', requireToken, removeBlanks, (req, res, next) => {
      // If the client attempts to change the owner of the pet, we can disallow that from the getgo
      delete req.body.owner
      // Then we find the pet by the id
      Pet.findById(req.params.id)
        // Handle our 404
        .then(handle404)
        // requireOwnership and update the pet
        // requireOwnership requires requireToken so it can get the owner ID
        .then(pet => {
        requireOwnership(req, pet)

            return pet.updateOne(req.body.pet)
        })
        // Send a 204 no content if successful
        .then(() => res.sendStatus(204))
        // Pass to errorhandler if not successful
        .catch(next)
})

// REMOVE -> DELETE /pets/624466855484cefd56290392
router.delete('/pets/:id', requireToken, (req, res, next) => {
    // find the pet by ID
    Pet.findById(req.params.id)
        // First handle the 404 if any
        .then(handle404)
        // Use requireOwnership middleware to make sure the right person is making this request
        .then( pet => {
            // requireOwnership needs 2 arguements
            // these are the req, and the document itself
            // requireOwnership requires requireToken so it can get the owner ID
            requireOwnership(req, pet)
            // delete if the middleware doesnt throw an error
            pet.deleteOne()
        })
        // send back a 204 - No Content status
        .then( () => res.sendStatus(204))
        // If error ocurrs, pass to the handler
        .catch(next)
})


/***********************************************/

// Keep at bottom of file
module.exports = router