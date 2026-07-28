const mongoose=require('mongoose');
module.exports=mongoose.model('NGO',new mongoose.Schema({name:String,email:String,phone:String,address:String,verified:Boolean},{timestamps:true}));