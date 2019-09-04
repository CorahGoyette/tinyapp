const express = require("express");
const app = express();
const PORT = 8080; // default port 8080
const bodyParser = require('body-parser');

app.use(bodyParser.urlencoded({extended: true}));

const cookieParser = require('cookie-parser');
app.use(cookieParser());

const cookieSession = require('cookie-session');

const users = { 
  "userRandomID": {
    id: "userRandomID", 
    email: "user@example.com", 
    password: "purple-monkey-dinosaur"
  },
 "user2RandomID": {
    id: "user2RandomID", 
    email: "user2@example.com", 
    password: "dishwasher-funk"
  }
}

app.set("view engine", "ejs");


const urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com"
};


//==============================================================================
// register the routes for my application
//==============================================================================

// register my home routes
app.get("/", (req, res) => {
  res.redirect("/urls");
});

app.get("/urls", (req, res) => {
  let templateVars = { urls: urlDatabase, username : req.cookies.username};
  res.render("urls_index", templateVars);
});

// process login route
app.post("/login", (req, res) => {

  // extract properties from the form body
  let username = req.body.username;
  
  // set username into cookie
  res.cookie("username", username);
  res.redirect("/urls");
});  

//process logout route
app.post("/logout", (req, res) => {
  res.clearCookie("username");
  res.redirect("/urls");
});  

app.post("/urls/:shortURL/delete", (req, res) => {
  delete urlDatabase[req.params.shortURL];
  res.redirect('/urls');
});


app.get("/u/:shortURL", (req, res) => {
  const longURL = urlDatabase[req.params.shortURL];
  res.redirect(longURL);
});

app.get("/urls/new", (req, res) => {
  res.render("urls_new");
});

app.get("/urls/register", (req, res) => {
  res.render("urls_register");
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
        req.session.user_id = user;
        break;
      }
    }
  }
  res.redirect('/');
});

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});


/* ** to find users - have to call the user object */