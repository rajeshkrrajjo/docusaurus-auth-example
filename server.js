var config = require('./config.js');
var fs = require('fs');
var ejs = require('ejs');
var path = require('path');
var express = require('express');
var passport = require('passport');
var Strategy = require('passport-local').Strategy;
var helmet = require('helmet');
var expressDefend = require('express-defend');
// var blacklist = require('express-blacklist');
var mongoose = require('mongoose');
var securePassword = require('secure-password');

var pwd = securePassword();

var mongoURL = 'mongodb://' + config.database_user + ':' + config.database_pass + '@' + config.database;
mongoose.connect(mongoURL);

var servePath = path.join(__dirname, config.rootFolder);

var Invite = require('./models/invites');
var User = require('./models/users');


passport.use(new Strategy(
    function(username, password, cb) {
        User.find({
            email: username
        }, function(err, users) {
            if (err) throw err;

            try {
                var user = users[0];
                var verifyResult = pwd.verifySync(Buffer.from(password), Buffer.from(user.password));

                if (verifyResult == securePassword.VALID) {
                    return cb(null, user);
                } else {
                    return cb(null, false);
                }

            } catch (ex) {
                console.log(ex);
                return cb(null, false);
            }
        });
    }));

passport.serializeUser(function(user, cb) {
    cb(null, user.id);
});

passport.deserializeUser(function(id, cb) {
    User.findById(id, function(err, user) {
        if (err) {
            return cb(err);
        }

        cb(null, user);
    });
});

var app = express();

app.use(helmet());

// expressDefend.suspiciousUrlFragments.push({
//     category: 'Custom',
//     patterns: [
//         'wls-wsat',
//         'CoordinatorPortType',
//         'register?element_parents=account/mail/%23value&ajax_form=1&_wrapper_format=drupal_ajax',
//         'rss.php?mode=recent',
//         'struts2-rest-showcase/orders.xhtml',
//         'index.action',
//         'register?element_parents=account/mail/%23value&ajax_form=1&_wrapper_format=drupal_ajax',
//         'wp-login.php',
//         'index.do'
//     ]
// });

// app.use(blacklist.blockRequests('blacklist.txt'));

// app.use(expressDefend.protect({
//     maxAttempts: 5,
//     dropSuspiciousRequest: true,
//     consoleLogging: true,
//     logFile: 'suspicious.log',
//     onMaxAttemptsReached: function(ipAddress, url) {
//         blacklist.addAddress(ipAddress);
//     }
// }));


app.engine('html', function(filePath, options, callback) { // define the template engine
    fs.readFile(filePath, function(err, content) {
        if (err) return callback(err)

        content = content.toString();

        var guestOnly = new RegExp('\u00AB\!(.*?)\u00BB', 'g');

        content = content.replace(guestOnly, function(match, content) {
            return '<% if (!user) { %>' + content + '<% } %>';
        });

        var userOnly = new RegExp('\u00AB(.*?)\u00BB', 'g');

        content = content.replace(userOnly, function(match, content) {
            return '<% if (user) { %>' + content + '<% } %>';
        });

        var rendered = ejs.render(content.toString(), options);

        return callback(null, rendered)
    })
})

app.set('views', servePath);
app.set('view engine', 'html') // register the template engine
app.use('/css', express.static(path.join(servePath, 'css')));
app.use('/img', express.static(path.join(servePath, 'img')));

// Use application-level middleware for common functionality, including
// logging, parsing, and session handling.
app.use(require('morgan')('combined'));
app.use(require('cookie-parser')());
app.use(require('body-parser').urlencoded({
    extended: true
}));

app.use(require('express-session')({
    secret: '%JLzD7CE1XSOBtiXk3RFpi^v^h#ji@iTx#F$i#s5fAhla*dQm4bSOXVkVToOA5xr',
    resave: false,
    saveUninitialized: false
}));

app.use(passport.initialize());
app.use(passport.session());

app.get('/',
    function(req, res) {
        app.set('views', servePath);

        res.render('index.html', {
            user: req.user
        });
    });

app.get('/invite',
    require('connect-ensure-login').ensureLoggedIn(),
    function(req, res) {
        if (req.user.admin) {
            var code = makeid();

            new Invite({
                code: code
            }).save(function(err) {
                if (err) {
                    console.log(err);
                    throw 'Error creating invite.';
                }

                res.send(code);
            });
        } else {

            res.redirect('/');
        }

    });



app.post('/updatePass',
    require('connect-ensure-login').ensureLoggedIn(),
    function(req, res) {

        User.find({
            email: req.user.email
        }, function(err, users) {
            if (err) throw err;

            if (users.length > 0) {

                var user = users[0];
                user.password = pwd.hashSync(Buffer.from(req.body.passwordUpdate)).toString();

                user.save(function(err) {
                    if (err) throw err;
                    res.redirect('/profile');
                });
            } else {
                res.redirect('/');
            }
        });
    });

app.post('/signup',
    function(req, res) {

        Invite.find({
            code: req.body.invite
        }, function(err, invites) {
            if (err) throw err;

            if (invites.length > 0) {

                var invite = invites[0];
                invite.useCount++;
                invite.save();

                new User({
                    invite: req.body.invite,
                    email: req.body.email,
                    password: req.body.password
                }).save(function(err) {
                    if (err) throw err;
                    res.redirect('/login');
                });
            } else {
                res.redirect('/');
            }
        });
    });

app.post('/login',
    passport.authenticate('local', {
        failureRedirect: '/login'
    }),
    function(req, res) {
        res.redirect('/');
    });

app.get('/logout',
    function(req, res) {
        req.logout();
        res.redirect('/');
    });


app.get('/~:fileId',
    require('connect-ensure-login').ensureLoggedIn(),
    function(req, res) {
        let fileId = sanitizeFileId(req.params.fileId);
        renderInsecure(fileId, '/docs', req, res);
    });

app.get('/:fileId',
    function(req, res) {
        let fileId = sanitizeFileId(req.params.fileId);

        renderInsecure(fileId, '', req, res);
    });

app.get('/docs/~:fileId',
    require('connect-ensure-login').ensureLoggedIn(),
    function(req, res) {
        let fileId = sanitizeFileId(req.params.fileId);

        renderSecure(fileId, '/docs', req, res);

    });

app.get('/docs/:fileId',
    function(req, res) {
        let fileId = sanitizeFileId(req.params.fileId);
        renderInsecure(fileId, '/docs', req, res);

    });


app.listen(config.port, function() {
    console.log('App listening on port ' + config.port);
});


function renderInsecure(fileId, folder, req, res) {
    app.set('views', servePath + folder);

    if (fs.existsSync(path.join(servePath, folder, fileId))) {
        res.render(fileId, {
            user: req.user
        });
    } else {
        renderSecure(fileId, folder, req, res);
    }
}

function renderSecure(fileId, folder, req, res) {
    app.set('views', servePath + folder);

    if (fs.existsSync(path.join(servePath, folder, '~' + fileId)) && req.user) {
        res.render('~' + fileId, {
            user: req.user
        });
    } else {
        res.redirect('/');
    }
}

function sanitizeFileId(fileId) {
    fileId = fileId.replace(/\.html/g, '');
    fileId = fileId.replace(/\~/, '');
    fileId = fileId + '.html';

    return fileId;
}

function makeid() {
    var text = "";
    var possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";

    for (var i = 0; i < 6; i++)
        text += possible.charAt(Math.floor(Math.random() * possible.length));

    return text;
}