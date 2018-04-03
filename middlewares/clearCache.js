const { clearCache } = require("../services/cache");

module.exports = async (req, res, next) => {
  await next();
  // every time we update the collection, we wipe out the cache
  clearHash(req.user.id);
};
