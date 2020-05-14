var config = require('./config.js');
var mongoose = require('mongoose');
var securePassword = require('secure-password');
var pwd = securePassword();

var mongoURL = 'mongodb://' + config.database_user + ':' + config.database_pass + '@' + config.database;
mongoose.connect(mongoURL);

var Invite = require('./models/invites');
var User = require('./models/users');

console.log(process.argv[2])

if (process.argv.length == 0) {

} else {

    if (process.argv[2] === '-create') {

        if (process.argv.length === 5) {
            console.log(process.argv[3])
            new User({
                displayName: process.argv[3],
                email: process.argv[3],
                invite: 'CLI',
                username: process.argv[3],
                password: process.argv[4]

            }).save(function(err) {
                if (err) {
                    console.log(err);
                } else {
                    console.log('User created')
                }
                process.exit();
            });

        } else {
            console.log('Command line parameters incorrect.')
            process.exit();
        }
    }

    if (process.argv[2] === '-reset') {
        if (process.argv.length === 5) {
            User.find({
                email: process.argv[3]
            }, function(err, users) {
                if (err) {
                    console.log(err);
                    process.exit();
                } else {
                    var user = users[0];
                    user.password = pwd.hashSync(Buffer.from(process.argv[4])).toString();
                    user.save(function(err) {
                        if (err) {
                            console.log(err);
                        } else {
                            console.log('User password updated.')
                        }
                        process.exit();
                    });
                }

            });

        } else {
            console.log('Command line parameters incorrect.')
            process.exit();
        }
    }

    if (process.argv[2] === '-elevate') {
        if (process.argv.length === 4) {
            User.find({
                email: process.argv[3]
            }, function(err, users) {
                if (err) {
                    console.log(err);
                    process.exit();
                } else {
                    var user = users[0];
                    user.admin = true;
                    user.save(function(err) {
                        if (err) {
                            console.log(err);
                        } else {
                            console.log('User elevated.')
                        }
                        process.exit();
                    });
                }

            });

        } else {
            console.log('Command line parameters incorrect.');
            process.exit();
        }

    }

}