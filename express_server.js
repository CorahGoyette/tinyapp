const express = require("express");
const app = express();
const PORT = 8080;

const bodyParser = require('body-parser')

const cookieParser = require ("cookie-parser")
app.use(cookieParser())


app.use(bodyParser.urlencoded({ extended: false })); 
const cookieSession = require('cookie-session');

app.set("view engine", "ejs");

const urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com"
};

app.post("/urls/:shortURL/delete", (req, res) => {
  delete urlDatabase[req.params.shortURL];
  res.redirect('/urls');
})

app.get("/", (req, res) => {
  res.render("index");
});

app.post("/login", (req, res) => {
  res.cookie("username", "hello");
  res.render("/");
})  

app.use(cookieSession({
  name: 'user_id',
  keys: ['id']
}));

app.get("/", (req, res) => {
  const templateVars = { user: undefined };
  templateVars.user = req.session.user_id ? users[req.session.user_id] : undefined;
  res.render('index', templateVars );
});

app.post("/login", (req, res) => {

  for (let user in users) {
    console.log(users[user]);
    if (users[user].username === req.body.username) {
      if (users[user].password === req.body.password) {
        // res.cookie('user_id', user);
        req.session.user_id = user;
        break;
      }
    }
  }
  res.redirect('/');
});

app.get("/u/:shortURL", (req, res) => {
  const longURL = urlDatabase[req.params.shortURL];
  res.redirect(longURL);
});

app.get("/urls/new", (req, res) => {
  res.render("urls_new");
});

app.get("/urls", (req, res) => {
  let templateVars = { urls: urlDatabase };
  res.render("urls_index", templateVars);
});

app.get("/", (req, res) => {
  res.send("Hello!");
});

app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
});

app.get("/hello", (req, res) => {
  res.send("<html><body>Hello <b>World</b></body></html>\n");
});

app.get("/urls/:shortURL", (req, res) => {
  let templateVars = { shortURL: req.params.shortURL, longURL: req.params.longURL };
  res.render("urls_show", templateVars);
});

app.post("/urls", (req, res) => {
  const shortURL = generateRandomString();
  urlDatabase[shortURL] = req.body.longURL;
  res.redirect(`/urls/${shortURL}`);       
});

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});

app.get("urls/login", (req, res) => {
let templateVars = {
  username: req.cookies["username"] };
res.render("urls_index", templateVars);
});

function generateRandomString() {
  let randomString = ""
  const alpha = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789abcdefghijklmnopqrstuvxyz";
  let alphaLength = alpha.length;

    for (let i = 0; i < 6; i ++) {
    randomString += alpha.charAt(Math.floor(Math.random() * alphaLength));
    }
  return randomString;
}
