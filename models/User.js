const mongoose=require('mongoose')

const userSchema=mongoose.Schema({
    email:{
        type: String,
        required: true
    },
    firstName: {
        type: String,
        //required: true,
        default:""
    },
    lastName:{
        type: String,
        //required: true,
        default: ""
    },
    middleName:{
        type: String,
        //required: true,
        default: ""
    },
    password: {
        type: String,
        required: true,
        min: 6
    },
    cvs: {
        type: Array,
        default:[]
    },
    isActive: {
        type: Boolean,
        default: true
    },
    registerDate: {
        type: String,
        default: new Date()
    },
    inActivatedDate: {
        type: String,
        default: ""
    },
    profileImage: {
        type: String,
        default: ""
    },
    phone: {
        type: String,
        default: ""
    },
    location: {
        type: String,
        default: ""
    },
    educations: {
        type: Array,
        default:[]
    },
    experiences: {
        type: Array,
        default: []
    },
    projects: {
        type: Array,
        default: []
    },
    languages: {
        type: Array,
        default: []
    },
    skills: {
        type: Array,
        default: []
    },
    socials: {
        type: Array,
        default: []
    }

})

module.exports=mongoose.model('User',userSchema)