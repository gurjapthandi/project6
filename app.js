#!/usr/bin/node

/** */
/** Dependencies */
var express = require('express');
var http = require('http');
var bodyparser = require('body-parser');
var fs = require('fs');
var jsonfile = require('jsonfile');
var bcrypt = require('bcrypt');



const saltRounds = 10;

/** Stores users as JSON */
var userfile = "users.txt";

/** Initialize express.js and its templates */
var app = express();
app.use(bodyparser.urlencoded({
    extended: true
}));
app.set('views', './views');
app.set('view engine', 'pug');

/** Initialize the Web Server */
http.createServer(app).listen("8080", function() {
    console.log("Web Server is listening on port 8080");
});

/** Default Page
        Renders template from view/login.pug
 */
app.get('/', function(req, res) {
    res.render('login');
});

/** Checks credentials when POST to /login-check
        Parses JSON file for usernames
        Compares post data with stored data
 */
app.post('/login-check', function(req, res) {

    /** Load User "database" */
    jsonfile.readFile(userfile, function(er, data) {

        var found = data.filter(function(item) {
            return item.name == req.body.name
        });

        bcrypt.compare(req.body.password, found[0].password, function(err, result) {
            if (result == true) {
                res.send("Login successful!")
            } else {
                res.send("Login failed because of wrong password or non-existing account.")
            }
        });
    });
});

/** New user page. Renders template from views/newuser.pug */
app.get('/add-users', function(req, res) {
    res.render('newuser');
});

/** Current users page.
        Reads userfile "database".
        Renders template from views/users.pug by passing the users object
 */
app.get('/users', function(req, res) {
    jsonfile.readFile(userfile, function(err, obj) {
        if (err)
            throw err;
        console.log(obj);
        res.render('users', {
            users: obj
        });
    });
});

/** Add users page.
        Reads userfile "database".
        Appends JSON object with POST data to the old userfile object.
        Writes new object to the userfile.
 */
app.post('/adduser', function(req, res) {
    // storing users in file
    bcrypt.genSalt(saltRounds, function(err, salt) {
        bcrypt.hash(req.body.password, salt, function(err, hash) {

            var userdata = {
                name: req.body.name,
                password: hash,
                twofactor: "disabled"
            };

            jsonfile.readFile(userfile, function(er, data) {
                data.push(userdata);
                jsonfile.writeFile(userfile, data, (err) => {
                    res.send('successfully registered new user...<br>'
                        + '<a href="/users">Back to User List</a>');
                });
            });
        });
    });
});