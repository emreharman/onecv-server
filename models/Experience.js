const mongoose=require("mongoose")

const experienceSchema=mongoose.Schema({
    jobTitle:{
        type: String
    },
    companyName: {
        type: String
    },
    city: {
        type: String
    },
    country: {
        type: String
    },
    startDate: {
        type: String
    },
    exitDate: {
        type: String
    },
    descriptions: {
        type: Array,
        default: []
    }
})
