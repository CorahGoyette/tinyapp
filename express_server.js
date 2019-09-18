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
// register the VIEW routes for my application
//==============================================================================

// For the ROOT URL, just redirect to our main page that displays URLS for current user
app.get("/", (req, res) => {
  res.redirect("/urls");
});

// Main page - display all the URLs for the current logged in user
app.get("/urls", (req, res) => {
  let theirUserId = req.session.theirUserId;
  let templateVars = { urls: urlsForUser(theirUserId), user : userDatabase[theirUserId]};
  res.render("urls_index", templateVars);
});


// Route to show the registration page
app.get("/urls/register", (req, res) => {
  res.render("urls_register");
});

// Route to show the login page
app.get("/urls/login", (req, res) => {
  res.render("urls_login");
});

// Route to show the new URL page
app.get("/urls/new", (req, res) => {
  let theirUserId = req.session.theirUserId;
  if (theirUserId === undefined) {
    res.redirect("/urls/login");
  } else {   
    let templateVars = { urls: urlDatabase, user : userDatabase[theirUserId]};
    res.render("urls_new", templateVars);
  }
});


// Route to show the edit form
app.get("/urls/:shortURL/edit", (req, res) => {
  let theirUserId = req.session.theirUserId;
  if (theirUserId === undefined) {
    res.redirect("/urls/login");
  } else {
    let url = urlDatabase[req.params.shortURL];
    let templateVars = { shortURL: req.params.shortURL, longURL: url.longURL };
    res.render("urls_show", templateVars);
  }
});


//==============================================================================
// register the HANDLER routes for my application
//==============================================================================

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

// Route to process login route
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

// Route to process logout route
app.post("/logout", (req, res) => {
  req.session.theirUserId = undefined;
  res.redirect("/urls");
});  


// Route to CREATE a new URL
app.post("/urls", (req, res) => {
  const shortURL = generateRandomString();
  let theirUserId = req.session.theirUserId;
  urlDatabase[shortURL] = {longURL:req.body.longURL, userID: theirUserId};
  res.redirect(`/urls`);       
});


// UPDATE the URL
app.post("/urls/:shortURL/update", (req, res) => {

  // Extract the updated long URL from the body
  let longURL = req.body.longURL;

  // Find the record from the URL database for the short url
  let url = urlDatabase[req.params.shortURL];

  // Update the long URL in our database
  url.longURL = longURL;

  res.redirect('/urls');
});


// DELETE the URL
app.post("/urls/:shortURL/delete", (req, res) => {
  delete urlDatabase[req.params.shortURL];
  res.redirect('/urls');
});


// Open the short URL
app.get("/u/:shortURL", (req, res) => {
  const longURL = urlDatabase[req.params.shortURL].longURL;
  res.redirect(longURL);
});


app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
});



//==============================================================================
// this function generates a random string for ID and short URL
//==============================================================================
const generateRandomString = function() {
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

//==============================================================================
// function that tracks how many times someone has visited the site
////have to call the visitcounter function still //////==============================================================================
const VisitCounter = function() {
  const visits = GetCookie("counter");
  if (!visits) {visits = 1;
    document.write("This is your first time here, Welcome!");
  } else {
    visits = parseInt(visits) + 1;
    document.write("You have visited this site " + visits + " times.");
  } setCookie("counter", visits,expdate);
}; 




// Displaying we are in the port correctly
app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});

