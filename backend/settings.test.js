const rewire = require('rewire')

var inserted = []

const fakeDb = {
  collection: name => {
    return {
      findOne: async () => null,
      insertOne: async (item) => inserted.push(item)
    }
  }
}

const fakeDbClient = {
  db: name => {
    return fakeDb
  }
}


test('generates a unique nickname', async () => {
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