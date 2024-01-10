const express = require('express');
const MongoClient = require('mongodb').MongoClient;
const hbs = require('hbs');
require("dotenv").config();

const app = express();

//modular function to be reused
async function connect(mongoURL, databaseName){
const client = await MongoClient.connect(mongoURL)
const db = client.db(databaseName)
return db
}

async function main() {
const db = await connect(process.env.MONGO_URL, "sctp_cico")
}
main();

app.listen(3000, function(){
    console.log("Server has started");
})