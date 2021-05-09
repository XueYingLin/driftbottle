const nicknamePrefixes = [
  "Rowdy",
  "Fishy",
  "Watery",
  "Calm",
  "Gentle",
  "Silly",
  "Fancy",
  "Magnificent",
  "Dazzling",
  "Scruffy",
  "Collossal",
  "Mammoth",
  "Scrawny",
  "Scary",
  "Wacky",
  "Mysterious",
  "Zealous",
  "Sandy",
  "Scary"
]

const nicknameSuffixes = [
  "Pirate",
  "Hound",
  "Shell",
  "Bottle",
  "Tree",
  "Friday",
  "Monday",
  "Biscuit",
  "Cookie",
  "Beer",
  "Towel",
  "Wave",
  "Drifter",
  "Writer",
  "Shipmate",
  "Explorer"
]

async function _generateUniqueNickname(collection) {
  let prefix = nicknamePrefixes[getRandomInt(nicknamePrefixes.length)]
  let suffix = nicknameSuffixes[getRandomInt(nicknameSuffixes.length)]

  let nickname = prefix + suffix

  let count = 0
  while (true) {
    let matched = await collection.findOne({ nickname })
    if (matched === null) {
      return nickname
    }

    count++
    nickname = nickname + count
  }
}

function settings(dbClient) {
  const collection = dbClient.db('driftbottle').collection('settings')
  return {
    // Reads settings for the given user and return the settings object. If
    // no settings object exists for this user, creates a new default one.
    readSettings: async (userId) => {
      let settings = await collection.findOne({ userId })
      if (settings === null) {
        settings = {
          userId,
          nickname: await _generateUniqueNickname(collection)
        }
        collection.insertOne(settings)
      }
      return settings
    },
    updateSettings: async (userId, settings) => {
      settings.userId = userId
      delete settings._id
      await collection.replaceOne({ userId }, settings, { upsert: true })
    }
  }
}

function getRandomInt(max) {
  return Math.floor(Math.random() * max)
}

module.exports = settings
