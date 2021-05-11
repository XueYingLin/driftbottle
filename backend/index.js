const express = require('express')
const cors = require('cors')
const { MongoClient, ObjectID } = require('mongodb');
const jwt = require('express-jwt')
const jwks = require('jwks-rsa')
const jwtAuthz = require('express-jwt-authz');
const settings = require('./settings');
const chest = require('./chest')

const db = "driftbottle";

// Connect to the database
let dbClient = null;
let userSettings = null;
let userChests = null;

const mongoUri = process.env.MONGODB_URI || 'mongodb://localhost'

MongoClient.connect(mongoUri).then(client => {
  console.log("Connected to Mongo")
  dbClient = client
  userSettings = settings(client)
  userChests = chest(client)
}).catch(err => console.error("Failed to connect to mongodb", err))

const app = express()
app.use(express.json())
app.use(cors())


// Set up JWT for authenticated endpoints
var jwtSettings = {
  secret: jwks.expressJwtSecret({
    cache: true,
    rateLimit: true,
    jwksRequestsPerMinute: 5,
    jwksUri: 'https://dev-driftbottle.us.auth0.com/.well-known/jwks.json'
  }),
  audience: 'https://driftbottle.app/api',
  issuer: 'https://dev-driftbottle.us.auth0.com/',
  algorithms: ['RS256']
}
var jwtCheck = jwt(jwtSettings)
var jwtSettingsOptional = { ...jwtSettings }
jwtSettingsOptional.credentialsRequired = false
var jwtCheckOptional = jwt(jwtSettingsOptional)

// Set up REST API
app.get("/api/messages", async (req, res) => {
  let messages = await dbClient.db(db).collection("messages").find({})

  // Filter out userIds so we don't send them to the client.
  let messages_array = await messages.toArray();
  messages_array = messages_array.map(msg => {
    delete msg.userId
    return msg
  });
  res.json(messages_array)
})

app.post("/api/messages", jwtCheckOptional, async (req, res) => {
  let document = req.body;
  document.created = new Date();

  if (req.user !== undefined) {
    let settings = await userSettings.readSettings(req.user.sub)
    document.userId = req.user.sub
    document.signature = {
      stamp: settings.stamp,
      nickname: settings.nickname
    }
  }

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

// Get all the messages in my chest. This includes both stored messages and replies.
app.get("/api/chest", jwtCheck, async (req, res) => {
  let chest = await userChests.getChestForUser(req.user.sub)

  let allMessages = []
  for (message of chest.replies) {
    delete message.userId
    message.isReply = true
    allMessages.push(message)
  }

  for (messageId of chest.storedMessages) {
    let message = await dbClient.db(db).collection("messages").findOne({ "_id": ObjectID(messageId) })
    if (message !== undefined) {
      delete message.userId
      message.isReply = false
      allMessages.push(message)
    }
  }

  res.json({ messages: allMessages })
})

// API to store a reference to an existing message in my own chest
app.put("/api/chest/:messageId", jwtCheck, async (req, res) => {
  res.json(await userChests.storeMessageInChest(req.user.sub, req.params.messageId))
})

// API to create a private message that's a reply to another message.
app.post("/api/messages/:id/replies", jwtCheck, async (req, res) => {

})

// Set up static serving for the react code
app.use(express.static("../frontend/build"))
app.get("*", (req, res) => {
  var path = require('path')
  res.sendFile(path.resolve(__dirname + "/../client/build/index.html"))
})

// Start listening
const port = process.env.PORT || 4000
app.listen(port, () => {
  console.log(`Running at http://localhost:${port}`)
})
