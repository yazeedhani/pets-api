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

// POST /toys/<pet_id> -> to create a toy
router.post('/toys/:petId', (req, res, next) => {
    // Get our toy from req.body
    const toy = req.body.toy
    // Get our petId from req.params.id
    const petid = req.params.petId
    // Find the pet
    Pet.findById(petid)
        // Handle what happens if no pet is found
        .then(handle404)
        .then( pet => {
            console.log('this is the pet', pet)
            console.log('this is the toy', toy)
            // Push the toy to the toys array
            pet.toys.push(toy)

            // Save the pet
            return pet.save()
        })
        // Then we send the pet as json
        .then( pet => res.status(201).json({ pet: pet }))
        // Catch errors and send to the handler
        .catch(next)
})


// PATCH /toys/<pet_id>/<toy_id> -> to update a toy
router.patch('/toys/:petId/:toyId', requireToken, removeBlanks, (req, res, next) => {
    const toyId = req.params.toyId
    const petId = req.params.petId

    Pet.findById(petId)
        .then(handle404)
        .then(pet => {
            const theToy = pet.toys.id(toyId)
            console.log('this is the original toy', theToy)
            requireOwnership(req, pet)

            theToy.set(req.body.toy)

            return pet.save()
        })
        // .then(data => {
        //     const { theToy, pet } = data
        //     // console.log('this is data in update', data)
        //     console.log('this is the toy in req.body', req.body.toy)
        //     console.log('type from req.body', typeof req.body.toy.isSqueaky)
        //     console.log('theToy', theToy)
        //     console.log('pet', pet)
        //     theToy.name = req.body.toy.name
        //     theToy.description = req.body.toy.description
        //     if (req.body.toy.isSqueaky) {
        //         theToy.isSqueaky = true
        //     } else {
        //         theToy.isSqueaky = false
        //     }
        //     theToy.condition = req.body.toy.condition
                // THIS SYNTAX ERROR CAUSED A WORLD OF HURT
        //     // theToy.set({ toy: req.body.toy })
        //     console.log('theToy after updating', theToy)

        //     return pet.save()
        // })
        .then(() => res.sendStatus(204))
        .catch(next)


})

// DELETE /toys/<pet_id>/<toy_id> -> to delete a toy
router.delete('/toys/:petId/:toyId', requireToken, (req, res, next) => {
    // saving both ids to variables for easy ref later
    const toyId = req.params.toyId
    const petId = req.params.petId
    // find the pet in the db
    Pet.findById(petId)
        // if pet not found throw 404
        .then(handle404)
        .then(pet => {
            // get the specific subdocument by its id
            const theToy = pet.toys.id(toyId)
            // require that the deleter is the owner of the pet
            requireOwnership(req, pet)
            // call remove on the toy we got on the line above requireOwnership
            theToy.remove()

            // return the saved pet
            return pet.save()
        })
        // send 204 no content
        .then(() => res.sendStatus(204))
        .catch(next)
})

/***********************************************/

// Keep at bottom of file
module.exports = router