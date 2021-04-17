const express = require('express')
const { MongoClient } = require('mongodb');

// Connect to the database
let dbClient;
MongoClient.connect("mongodb://localhost").then(client => {
  console.log("Connected to Mongo")
  dbClient = client
}).catch(err => console.error("Failed to connect to mongodb", err))

const app = express()
app.use(express.json())
const port = 3000

// Set up REST API
app.get("/api/messages", async (req, res) => {
  let messages = await dbClient.db("exampledb").collection("messages").find({})
  let messages_array = await messages.toArray();
  res.json(messages_array)
})

app.post("/api/messages", async (req, res) => {
  dbClient.db("exampledb").collection("messages").insertOne(req.body)
  res.send(req.body)
})

// Set up static serving for the react code
app.use(express.static("../frontend/build"))
app.get("*", (req, res) => {
  var path = require('path')
  res.sendFile(path.resolve(__dirname + "/../client/build/index.html"))
})

// Start listening
app.listen(port, () => {
  console.log(`Running at http://localhost:${port}`)
})
