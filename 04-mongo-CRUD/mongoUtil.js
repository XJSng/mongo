// mongoUtil : this file contains utility functions related to Mongo
// Any JS file that have functions but does nothing
// but just to export them are known as modules

// Modular function to be reused
const {MongoClient} = require('mongodb');
async function connect(mongoURL, databaseName){
    const client = await MongoClient.connect(mongoURL)
    const db = client.db(databaseName)
    return db
    }
    

// exporting this as connect
module.exports = {connect}