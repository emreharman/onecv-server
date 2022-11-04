const  mongoose=require('mongoose')
const languageSchema=mongoose.Schema({
    name:{
        type: String
    },
    level:{
        type:Number,
        max:5,
        min:1
    }
})
