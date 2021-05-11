const rewire = require('rewire')

var inserted = []

const existingUser = {
  userId: "user-888",
  stamp: "glass",
  nickname: "WileyToad"
}

const fakeDb = {
  collection: name => {
    return {
      findOne: async (filter) => {
        if (filter.userId === 'user-888') {
          return existingUser
        }
        return null
      },
      insertOne: async (item) => inserted.push(item)
    }
  }
}

const fakeDbClient = {
  db: name => {
    return fakeDb
  }
}


test('generates a unique nickname when no settings exist', async () => {
  // Rewire these random things so they're predictable for testing.
  const settings = rewire('./settings')
  settings.__set__('getRandomPrefix', () => "First")
  settings.__set__('getRandomSuffix', () => "Second")
  settings.__set__('getRandomStamp', () => "skull")

  let dbSettings = settings.settings(fakeDbClient)
  let result = await dbSettings.readSettings("user-123")

  expect(result).toEqual({
    userId: "user-123",
    stamp: "skull",
    nickname: "FirstSecond"
  })

  expect(inserted.length).toBe(1)
})

test('gets settings for existing user', async () => {
  inserted = []
  const settings = require('./settings')
  let dbSettings = settings.settings(fakeDbClient)
  let result = await dbSettings.readSettings("user-888")
  
  expect(result).toEqual(existingUser)

  expect(inserted.length).toBe(0)
})