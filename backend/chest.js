const { ObjectID } = require('mongodb');

function chest(dbClient) {
  const collection = dbClient.db('driftbottle').collection('chests')

  return {
    getChestForUser: async (userId) => {
      let chest = await collection.findOne({ userId })
      if (chest === null) {
        chest = {
          userId,
          replies: [],
          storedMessages: []
        }
        collection.insertOne(chest)
      }
      return chest
    },
    storeMessageInChest: async (userId, messageId) => {
      return await collection.updateOne(
        { userId },
        {
          $addToSet: { storedMessages: ObjectID(messageId) }
        })
    }
  }
}

module.exports = chest