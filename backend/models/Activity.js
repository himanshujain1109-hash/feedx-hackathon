const mongoose=require('mongoose');
module.exports=mongoose.model('Activity',new mongoose.Schema({title:String,type:String},{timestamps:true}));