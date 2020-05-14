var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var securePassword = require('secure-password');
var pwd = securePassword();

var userSchema = new Schema({
    email: {
        type: String,
        required: true,
        index: true,
        unique: true
    },
    invite: {
        type: String,
        required: true
    },
    password: {
        type: Buffer,
        required: true
    },
    admin: {
        type: Boolean,
        default: false
    },
    created_at: Date,
    updated_at: Date
});


userSchema.pre('save', function(next) {
    var currentDate = new Date();

    if (this.isNew) {
        this.password = pwd.hashSync(Buffer.from(this.password)).toString();
    }

    this.updated_at = currentDate;

    if (!this.created_at)
        this.created_at = currentDate;

    next();
});

var User = mongoose.model('User', userSchema);

module.exports = User;