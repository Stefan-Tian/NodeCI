const mongoose = require("mongoose");
const redis = require("redis");
const util = require("util");
const keys = require("../config/keys");

const client = redis.createClient(keys.redisUrl);
client.hget = util.promisify(client.hget);
const exec = mongoose.Query.prototype.exec;

mongoose.Query.prototype.cache = function(options = {}) {
  // toggle the cache option to true
  this.useCache = true;
  // hashkey is made by us (can only contain number and string)
  this.hashKey = JSON.stringify(options.key || "");
  return this;
};

mongoose.Query.prototype.exec = async function() {
  // check if we want this query cached
  if (!this.useCache) {
    // if not, return the original exec call
    return exec.apply(this, arguments);
  }
  // we're gonna use our query and collection name
  // combine together as our key
  const key = JSON.stringify({
    ...this.getQuery(),
    collection: this.mongooseCollection.name
  });

  // See if we have a value for key in redis
  // hget means get from nested hash
  const cacheValue = await client.hget(this.hashKey, key);
  // If we do, return that
  if (cacheValue) {
    // we need to turn it from json to mongoose document
    const doc = JSON.parse(cacheValue);
    return Array.isArray(doc)
      ? doc.map(d => new this.model(d))
      : new this.model(doc);
  }
  // Otherwise, issue the query and store the result in redis
  // the result is mongoose documents, we have to change
  // it to only string and number
  const result = await exec.apply(this, arguments);
  // set expiration to 10 seconds, only apply to newly created data
  client.hset(this.hashKey, key, JSON.stringify(result), "EX", 10);
  return result;
};

module.exports = {
  clearHash(hashKey) {
    client.del(JSON.stringify(hashKey));
  }
};
