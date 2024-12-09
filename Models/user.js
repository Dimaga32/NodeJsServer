const { name } = require("ejs");
const mongoose  = require("mongoose");
const Schema= mongoose.Schema
const UserSchema= new Schema({
    id:{
        type:Number,
        required:true},
    name:{
        type:String,
        required:true},
    about:{
        type:String,
        required:true},
    })
const User= mongoose.model(`User`,UserSchema)
module.exports=User