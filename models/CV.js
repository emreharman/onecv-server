const mongoose=require('mongoose')
const Education = require('./Education')
const Experience = require('./Experience')
const Project=require('./Project')
const Language=require('./Language')
const Social=require('./Social')

const cvSchema=mongoose.Schema({
    jobTitle: {
        type:String
    },
    personalDescription: {
        type: String
    },
    educations:{
        type: Array,
        default: []
    },
    experiences:{
        type: Array,
        default: []
    },
    projects:{
        type: Array,
        default:[]
    },
    skills: {
        type: Array,
        default: []
    },
    languages:{
        type: Array,
        default: []
    },
    socialPlatforms:{
        type:Array,
        default:[]
    }
})
