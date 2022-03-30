const mongoose = require('mongoose')
const toySchema = require('./toy')

const { Schema, model } = mongoose

const petSchema = new Schema(
    {
        name: 
        {
            type: String,
            required: true
        },
        type: 
        {
            type: String,
            required: true
        },
        age: 
        {
            type: String,
            required: true
        },
        adoptable:
        {
            type: Boolean,
            required: true
        },
        toys: [toySchema],
        owner: {
            type: Schema.Types.ObjectId,
            ref: 'User'
        }
    }, {
        timestamps: true,
        // We're going to add virtuals to our model
        // These lines ensure that the virtual will be included whenever we turn our document to an object or JSON
        toObject: {virtuals: true},
        toJSON: {virtuals: true}
    }
)

// Virtuals go here
// A virtual is a virtual property that uses the data that's saved in the DB to add a property whenever we retrieve that document and convert it to an object.
// Virtuals are not saved in the database.
petSchema.virtual('fullTitle').get(function () {
    // We can do whatever javascripty things we want in here
    // we just need to make sure we return some value
    // fullTitle is going to combine the name and type to build a title
    return `${this.name} the ${this.type}`
})

petSchema.virtual('isABaby').get(function() {
    if (this.age < 5) {
        return 'yeah theyre just a baby'
    } else if (this.age >= 5 && this.age < 10) {
        return 'not really a baby, but still a baby'
    } else {
        return 'a good old pet (definitely still a baby)'
    }
})

module.exports = model('Pet', petSchema)