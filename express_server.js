const express = require("express");
const app = express();
const PORT = 8080; // default port 8080
const bodyParser = require('body-parser');

app.use(bodyParser.urlencoded({extended: true}));

const { getUserByEmail } = require("./helpers");
const bcrypt = require("bcrypt");

app.set("view engine", "ejs");

const cookieSession = require('cookie-session');
app.use(cookieSession({
  name: 'session',
  keys: ['key1', 'key2']
}));

const userDatabase = { 
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
};

const urlDatabase = {
  "b2xVn2": { longURL: "http://www.lighthouselabs.ca", userID: "aJ48lW"},
  "9sm5xK": {longURL: "http://www.google.com", userID: "aJ48lW"}
};

//==============================================================================
// register the routes for my application
//==============================================================================

// register my home routes
app.get("/", (req, res) => {
  res.redirect("/urls");
});

app.get("/urls", (req, res) => {
  let theirUserId = req.session.theirUserId;
  let templateVars = { urls: urlsForUser(theirUserId), user : userDatabase[theirUserId]};
  res.render("urls_index", templateVars);
});

//route to get the register page
app.get("/urls/register", (req, res) => {
  res.render("urls_register");
});

//route to get the login page
app.get("/urls/login", (req, res) => {
  res.render("urls_login");
});

// route to handle the registration request
app.post("/register", (req, res) => {
  let email = req.body.email.trim();
  let password = req.body.password.trim();

  if (email === "" || password === "") {
    res.status(400).send('Please make sure your email and password are provided');
  } else if (getUserByEmail(email, userDatabase) !== null) { 
    res.status(400).send('Email already exists');
  } else {

    // hash password for security
    const hashedPassword = bcrypt.hashSync(password,10);

    // generate user with a random id
    let randomId = generateRandomString();
    let user = {
      id: randomId,
      email: req.body.email,
      password: hashedPassword
    };

    //adding user to database
    userDatabase[randomId] = user;
    console.log(userDatabase);

    //setting cookie containing user's new ID
    req.session.theirUserId = randomId;
    res.redirect("/urls");
  }
});

// process login route
app.post("/login", (req, res) => {

  // extract properties from the form body
  let email = req.body.email.trim();
  let password = req.body.password.trim();

  let user = getUserByEmail(email, userDatabase);
  if (user === null) {
    res.status(403).send('User not found!');
  } else if (bcrypt.compareSync(password, user.password) === false) { 
    res.status(403).send('Invalid password!');
  } else {
    req.session.theirUserId = user.id;
    res.redirect("/urls");
  }
});  

//process logout route
app.post("/logout", (req, res) => {
  req.session.theirUserId = undefined;
  res.redirect("/urls");
});  

app.post("/urls/:shortURL/delete", (req, res) => {
  delete urlDatabase[req.params.shortURL];
  res.redirect('/urls');
});


app.get("/u/:shortURL", (req, res) => {
  const longURL = urlDatabase[req.params.shortURL].longURL;
  res.redirect(longURL);
});

app.get("/urls/new", (req, res) => {
  let theirUserId = req.session.theirUserId;
  if (theirUserId === undefined) {
    res.redirect("/urls/login");
  } else {   
    let templateVars = { urls: urlDatabase, user : userDatabase[theirUserId]};
    res.render("urls_new", templateVars);
  }
});

app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
});

app.get("/urls/:shortURL", (req, res) => {
  let theirUserId = req.session.theirUserId;
  if (theirUserId === undefined) {
    res.redirect("/urls/login");
  } else {
    let templateVars = { shortURL: req.params.shortURL, longURL: req.params.longURL };
    res.render("urls_show", templateVars);
  }
});

// generating shortURL for the long URL provided using a random string
app.post("/urls", (req, res) => {
  const shortURL = generateRandomString();
  let theirUserId = req.session.theirUserId;
  urlDatabase[shortURL] = {longURL:req.body.longURL, userID: theirUserId};
  res.redirect(`/urls/${shortURL}`);       
});

//==============================================================================
// this function generates a random string for ID and short URL
//==============================================================================
function generateRandomString() {
  let randomString = "";
  const alpha = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789abcdefghijklmnopqrstuvxyz";
  let alphaLength = alpha.length;

  for (let i = 0; i < 6; i ++) {
    randomString += alpha.charAt(Math.floor(Math.random() * alphaLength));
  }
  return randomString;
}

//==============================================================================
// return longURL created by a particular user
//==============================================================================
const urlsForUser = function(id) {
  let urls = {};
  for (let shortUrl in urlDatabase) {
    let url = urlDatabase[shortUrl];
    if (url.userID === id) {
      urls[shortUrl] = url;
    }
  }
  return urls;
};

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});

