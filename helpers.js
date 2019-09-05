const getUserByEmail = function(email, database) {
  let result = null;
  for (let id in database){
    let user = database[id];
    if (user.email === email) {
      result = user;
      break;
    }
  }
  return result;
};

module.exports = { getUserByEmail };

