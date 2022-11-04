const mongoose=require('mongoose')

const educationSchema=mongoose.Schema({
    schoolName: {
        type: String
    },
    degree: {
        type: String
    },
    startDate: {
        type: String
    },
    finishDate: {
        type: String
    },
    average: {
        type: Number
    },
    city: {
        type: String
    },
    country: {
        type: String
    }
})
