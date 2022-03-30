// seed.js is going to be a script that we can run from the terminal to create a bunch of pets at once.

// We'll need to be careful here, and when we run it, because it will remove all the pets first, then add the new ones.

const mongoose = require('mongoose')
const Pet = require('./pet')

const db = require('../../config/db')

const startPets = [
    { name: 'Sparky', type: 'dog', age: 2, adoptable: true},
    { name: 'Leroy', type: 'dog', age: 10, adoptable: true},
    { name: 'Biscuits', type: 'cat', age: 3, adoptable: true},
    { name: 'Hulk Hogan', type: 'hamster', age: 1, adoptable: true}
]

// First we connect to the DB via mongoose
// Anything that happens here whether it is successfull or not will close the DB connection.
mongoose.connect( db, {
	useNewUrlParser: true,
})
    .then( () => {
        // Then we remove all the pets except the ones that have an owner
        // The pets created here are created without an owner
        Pet.deleteMany({ owner: null })
            .then( deletedPets => {
                console.log('deleted pets', deletedPets)
                // Then we create using the startPets array
                // We'll use console logs to check if it's working or if there are errors
                Pet.create(startPets)
                    .then( newPets => {
                        console.log('the new pets', newPets)
                        mongoose.connection.close()
                    })
                    .catch(error => {
                        console.log(error)
                        mongoose.connection.close()
                    })
            })
            .catch( error => {
                console.log(error)
                mongoose.connection.close()
            })
    })
    // Then at the end, we close our connection to the DB
    .catch(error => {
        console.log(error)
        mongoose.connection.close()
    })


