// Import dependencies
const mongoose = require("mongoose");

// Toy is a subdocument, i.e NOT a model
// Toy will be part of the toys array for specific pets

// We don't need to get model from mongoose, so in order to save some real estate,
// we'll just use the standard syntax for creating a schema like this:
const toySchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    description: {
        type: String
    },
    isSqueaky: {
        type: Boolean,
        default: false,
        required: true,
    },
    condition: {
        // the condition is going to be a type: String
        type: String,
        // but we'll use enum, so tht we can get a few specific answers, and nothing else.
        // enum is a validator on the type String, that says "you can only use the values that live in this array"
        enum: ['new', 'used', 'disgusting'],
        default: 'new'
    }
}, {
    timestamps: true
})

module.exports = toySchema