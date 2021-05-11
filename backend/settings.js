const STAMP_IDS = [
  "skull",
  "wine",
  "umbrella",
  "volleyball",
  "glass"
];

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

function getRandomPrefix() {
  return nicknamePrefixes[getRandomInt(nicknamePrefixes.length)]
}

function getRandomSuffix() {
  return nicknameSuffixes[getRandomInt(nicknameSuffixes.length)]
}

function getRandomStamp() {
  return STAMP_IDS[getRandomInt(STAMP_IDS.length)]
}

async function _generateUniqueNickname(collection) {
  let nickname = getRandomPrefix() + getRandomSuffix()

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
          stamp: getRandomStamp(),
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

module.exports = { settings }
