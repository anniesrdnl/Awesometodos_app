const { MongoClient } = require("mongodb");
require("dotenv").config();

const uri = process.env.MONGODB_URI;
const client = new MongoClient(uri);

let connection;

// Reuses one connection and retries on the next request if an attempt fails,
// so a brief outage at startup doesn't leave the API broken until a restart.
function connectDB() {
    if (!connection) {
        connection = client
            .connect()
            .then(() => {
                console.log("MongoDB Connected");
                return client.db("myDatabase");
            })
            .catch((err) => {
                connection = undefined;
                console.error("Failed to connect to MongoDB", err);
                throw err;
            });
    }
    return connection;
}

async function getCollection(name) {
    const database = await connectDB();
    return database.collection(name);
}

module.exports = {
    connectDB,
    getCollection
};
