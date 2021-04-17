const express = require('express')

const app = express()
const port = 3000

app.use(express.static("../frontend/build"))
app.get("*", (req, res) => {
  var path = require('path')
  res.sendFile(path.resolve(__dirname + "/../client/build/index.html"))
});

app.listen(port, () => {
  console.log(`Running at http://localhost:${port}`)
})
