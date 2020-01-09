const mongoose = require('mongoose');

let userSchema = new mongoose.Schema({
    username : String,
    email: String,
    DateCrawled: Date
});

let User = mongoose.model('User', userSchema);

module.exports = User;