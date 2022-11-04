const mongoose = require('mongoose')

const projectSchema=mongoose.Schema({
    title:{
        type: String
    },
    descriptions:{
        type: Array,
        default:[]
    },
    date: {
        type: String
    },
    link: {
        type: String
    }
})
