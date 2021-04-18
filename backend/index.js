const express = require('express')
const cors = require('cors')
const { MongoClient } = require('mongodb');

const db = "driftbottle";

// Connect to the database
let dbClient;
MongoClient.connect("mongodb://localhost").then(client => {
  console.log("Connected to Mongo")
  dbClient = client
}).catch(err => console.error("Failed to connect to mongodb", err))

const app = express()
app.use(express.json())
app.use(cors())

// Set up REST API
app.get("/api/messages", async (req, res) => {
  let messages = await dbClient.db(db).collection("messages").find({})
  let messages_array = await messages.toArray();
  res.json(messages_array)
})

app.post("/api/messages", async (req, res) => {
  dbClient.db(db).collection("messages").insertOne(req.body)
  res.send(req.body)
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
