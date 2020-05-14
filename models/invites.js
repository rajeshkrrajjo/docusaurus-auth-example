var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var inviteSchema = new Schema({
    code: {
        type: String,
        required: true
    },
    useCount: {
        type: Number,
        default: 0
    }
});

var Invite = mongoose.model('Invite', inviteSchema);

module.exports = Invite;