const express = require('express')
const cors = require('cors')
const { MongoClient } = require('mongodb');
const jwt = require('express-jwt')
const jwks = require('jwks-rsa')
const jwtAuthz = require('express-jwt-authz');
const settings = require('./settings');

const db = "driftbottle";

// Connect to the database
let dbClient;
let userSettings;
MongoClient.connect("mongodb://localhost").then(client => {
  console.log("Connected to Mongo")
  dbClient = client
  userSettings = settings(client)
}).catch(err => console.error("Failed to connect to mongodb", err))

const app = express()
app.use(express.json())
app.use(cors())


// Set up JWT for authenticated endpoints
var jwtCheck = jwt({
  secret: jwks.expressJwtSecret({
    cache: true,
    rateLimit: true,
    jwksRequestsPerMinute: 5,
    jwksUri: 'https://dev-driftbottle.us.auth0.com/.well-known/jwks.json'
  }),
  audience: 'https://driftbottle.app/api',
  issuer: 'https://dev-driftbottle.us.auth0.com/',
  algorithms: ['RS256']
})

// Set up REST API
app.get("/api/messages", async (req, res) => {
  let messages = await dbClient.db(db).collection("messages").find({})
  let messages_array = await messages.toArray();
  res.json(messages_array)
})

app.post("/api/messages", async (req, res) => {
  let document = req.body;
  document.created = new Date();
  dbClient.db(db).collection("messages").insertOne(document)
  res.send(document)
})

app.get("/api/settings", jwtCheck, jwtAuthz(['read:current_user_settings']), async (req, res) => {
  let settings = await userSettings.readSettings(req.user.sub)
  res.json(settings)
})

app.post("/api/settings", jwtCheck, jwtAuthz(['update:current_user_settings']), async (req, res) => {
  let settings = await userSettings.updateSettings(req.user.sub, req.body)
  res.json(settings)
})

// Set up static serving for the react code
app.use(express.static("../frontend/build"))
app.get("*", (req, res) => {
  var path = require('path')
  res.sendFile(path.resolve(__dirname + "/../client/build/index.html"))
})


// Start listening
const port = 4000
app.listen(port, () => {
  console.log(`Running at http://localhost:${port}`)
})
