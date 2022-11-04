const express = require('express')
const app=express()
const mongoose=require('mongoose')
const dotenv=require("dotenv")
dotenv.config()
const cors=require('cors')
const PORT = process.env.PORT || 3004


//connect db
mongoose.connect('mongodb://localhost:27017/',{
    dbName:'onecvappdemo',
    useNewUrlParser: true,
    useUnifiedTopology: true 
},(err)=>{
    if(err){
        console.log("DB Connection error",err)
    }else{
        app.listen(PORT,()=>console.log("DB Connection is Ok and listening PORT:",PORT))
    }
})

app.use(express.json());
app.use(cors({origin: '*'}));
app.get('/',(req,res)=>{
    res.send('Welcome to OneCV server')
})
app.use("/user",require("./routes/userRoutes"))