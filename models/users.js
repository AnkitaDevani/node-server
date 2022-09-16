const mongoose = require('mongoose');
var Schema = mongoose.Schema;
   var  ObjectId = Schema.ObjectId;

const userSchema = new mongoose.Schema({

    fname: {
        required: true,
        type: String
    },
    lname: {
        required: true,
        type: String
    },
    hobbies: {
        required: true,
        type: Array
    },
    email: {
        required: true,
        type: String
    },
    password:  {
        required: true,
        type: String
    },
    gender:  {
        required: true,
        type: String
    },
    course:  {
        required: false,
        type: ObjectId
    },
    profile:  {
        required: false,
        type: Object
    },
    token:{
        required: false,
        type: String
    },
    role:{
        required: true,
        type: String,

    }
});

module.exports = mongoose.model('Users', userSchema);