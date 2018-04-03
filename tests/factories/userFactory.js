const mongoose = require("mongoose");
const User = mongoose.model("User");

module.exports = () => {
  return new User({}).save();
};

// when we start jest, it uses another node env,
// so technically User model was not created
