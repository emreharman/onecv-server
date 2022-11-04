const mongoose=require('mongoose')
const socialSchema=mongoose.Schema({
    title:{
        type: String
    },
    link:{
        type: String
    }
})
