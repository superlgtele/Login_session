const http = require('http');
const express = require('express');
const session = require('express-session');
const fs = require('fs');
const bodyParser = require('body-parser');
const mysql = require('mysql');
const alert = require('alert');

const app = (module.exports = express());
const server = http.createServer(app);
const MySQLStore = require('express-mysql-session')(session);
const PORT = 3000;

let client = mysql.createConnection({
    user:'root',
  password:'prince0325',
  database:'graduated'
});

const options = {
    host: 'localhost',
    port: 3306,
    user: 'root',
    password: 'prince0325',
    database: 'graduated'
};

const sessionStore = new MySQLStore(options);

app.use(
    session({
        secret: 'secret key',
        store: sessionStore,
        resave: false,
        saveUninitialized: false
    })
);

app.use(bodyParser.urlencoded({extended: false }));

app.get('/register', (req, res) => {
    fs.readFile('./webpage/register.html', (error, data) => {
        if (error) {
            console.log(error);
            return res.status(500).send('<h1>500 error</h1>');
        }
        res.writeHead(200, { 'Content-Type': 'text/html' });
        res.end(data);
    });
})

app.post('/register', (req, res) => {
    var body = req.body;
    var id = body.id;
    var pw = body.pw;

    client.query('select * from peopled where id=?', ( err,data ) => {
        if (true) {
            console.log('회원가입 성공');
            client.query('insert into peopled(id, pw) values(?,?)',[
                id, pw
            ]);
            alert('회원가입 성공!');
            res.redirect('/login');
        } else {
            console.log('회원가입 실패');
            res.send('<script>alert("회원가입 실패");</script>')
            res.redirect('/register');
        }
    });
});

app.get('/login', (req, res) => {
    if (req.session.user !== undefined) return res.redirect('/');

    fs.readFile('./webpage/login.html', (error, data) => {
        if (error) {
            console.log(error);
            return res.status(500).send('<h1>500 error</h1>');
        }
        res.writeHead(200, { 'Content-Type': 'text/html' });
        res.end(data);
    });
});

// id, pw 체크

function intervalFunc() {
    client.query('select * from peopled' , (err, users) => {
        login = (id, pw) => {
        let len = users.length;
        for (let i = 0; i < len; i++) {
            if (id === users[i].id && pw === users[i].pw) return id;
        }
        return '';
    }
})};

setInterval(intervalFunc, 1000);

// login 요청
app.post('/login', (req, res) => {
    let id = req.body.id;
    let pw = req.body.pw;

    let user = login(id, pw);
    if (user === '') return res.redirect('/login');

    req.session.user = user;
    req.session.save(err => {
        if (err) {
            console.log(err);
            return res.status(500).send('<h1>500 error</h1>');
        }
        res.redirect('/');
    });
});

// main 페이지
app.get('/', (req, res) => {
    if (req.session.user === undefined) return res.redirect('/login');

    fs.readFile('./webpage/main.html', (error, data) => {
        if (error) {
            console.log(error);
            return res.status(500).send('<h1>500 error</h1>');
        }
        res.writeHead(200, { 'Content-Type': 'text/html' });
        res.end(data);
    });
});

// logout 요청
app.get('/logout', (req, res) => {
    req.session.destroy(err => {
        if (err) {
            console.log(error);
            return res.status(500).send('<h1>500 error</h1>');
        }
        res.redirect('/');
    });
});

server.listen(PORT, () => {
    console.log(`Server running on ${PORT}`);
});