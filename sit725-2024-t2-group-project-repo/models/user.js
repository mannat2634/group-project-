const { MongoClient, ServerApiVersion } = require('mongodb');
const uri = "mongodb+srv://wandabwafaith:Mukongolo2472@cluster0.anov8lm.mongodb.net/";
const client = new MongoClient(uri, {
    serverApi: {
        version: ServerApiVersion.v1,
        strict: true,
        deprecationErrors: true,
    }
});

users = client.db().collection('Users');
module.exports = users;