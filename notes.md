# Advanced Node.js

## Caching

* _Caching_ will extremely increase the speed of read process
* **Cache Server** - every time we try to query our database, we go through the _cache server_ first, it will check if the exact query has been executed before, if it hasn't, it'll send the query to mongoDB and mongoDB will execute the query, then, the query result send back to the _cache server_ to store, so if we make that query again, we can directly get the result from _cache server_ without going to mongoDB.
* **Cache server** is for faster reading processes, it does not have any effect on writing into database

## Redis

* An in memory database, fast for reading and writing data
* Redis is also key value pair
* We can only store string and number in redis
* Javascript Object is definitelly allowed, we should use JSON.stringify(jsObject)
* We can run `client.flushall()` to delete all the cache

## Testing

### How our google authentication process works

* When **user** visits `/auth/google`, **node** forward the user to **google**, then **user** enters login, redirected back to `/auth/google/callback`, **node** askes google for more details about user, and **google** responds with user profile, then **node** server sets cookie on users browser that identifies them. All future requests include cookie data that identifies this **user**
* When **google** redirects user back to **node** server, it automatically includes a query parameter which is called _code_(a random series of string and number)
* After **google** sends back the user profile, we then add it to our mongoDB user database

### How we're gonna fake cookie sessions

* We are not gonna touch the google part, but we're gonna fabricate some info to fake session like we're logged in
* In the response header, google sends us back with a _set-cookie_ setting up session and another _set-cookie_ setting up session signature
* The first object can actually be decoded to {"passport": {"user": "id" }}
* We use the second session signature to make sure the
  session wasn't manipulated
* The first argument "id" in deserializeUser is directly from the session

### Actual steps

* Create page instance
* Take an existing user ID and generate a fake session object with it
* Sign the session object with keygrip
* Set the session and signature on our Page instance as cookies

### Fake session continued

* We can combine the session and the cookie signing key to generate the session signature

### Test Factories - some data for testing

* Session Factory - create a new session, and a session signature
* User Factory - create a user instance
* We need to add `jest` setup thingy to package.json to access mongodb

### Proxies in Action

* `new Proxy();` it's a global function, no need to require it
* The first argument should be our additional class, the second should be an object of handler

### CI Flow

* Developer pushes code to github
* CI Server detects that a new push of code has occured
* CI Server clones project to a cloud based virtual machine
* CI Server runs all tests
* If all tests pass, CI Servers marks build as passing and does some optional followup(Send an Email, deploy, put notifications on Github, etc..)

### Travis CI Flow

* We push code to github
* Travis automatically detects pushed code
* Travis clones our project
* Travis runs tests using a `.travis.yml` file YAML
* If tests are OK, Travis sends us an email

### What YAML is(?)

* It's basically a simplified version of JSON
