const mongoose = require('mongoose');

const subjectList = new mongoose.Schema({
    subject: {
        required: false,
        type: String
    },
});

module.exports = mongoose.model('SubjectList', subjectList);