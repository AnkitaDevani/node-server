const mongoose = require('mongoose');

const logInUser = new mongoose.Schema({
    email: {
        required: true,
        type: String
    },
    token: {
        required: true,
        type: String
    }

});

module.exports = mongoose.model('LoginUser', logInUser);