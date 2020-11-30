const mongoose = require('mongoose');
const uniqueValidator = require('mongoose-unique-validator');

const usersSchema = mongoose.Schema({
    userId: {type : String, require : true },
    email : {type : String , require : true, unique : true},
    password : {type : String , require : true}
});
usersSchema.plugin(uniqueValidator);
module.exports = mongoose.model('User', usersSchema);