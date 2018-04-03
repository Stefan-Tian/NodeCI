const Buffer = require("safe-buffer").Buffer;
// we are gonna use keygrip to generate session signature
const Keygrip = require("keygrip");
const keys = require("../../config/keys");
const keygrip = new Keygrip([keys.cookieKey]);

module.exports = ({ _id }) => {
  // we're gonna use this to turn the id object back to session
  const sessionObject = {
    passport: {
      user: _id.toString() // it's an object in mongodb by default
    }
  };
  const session = Buffer.from(JSON.stringify(sessionObject)).toString("base64");
  const sig = keygrip.sign("session=" + session);

  return { session, sig };
};
