const express = require('express');
const MongoClient = require('mongodb').MongoClient;
const hbs = require('hbs');
require("dotenv").config();

const app = express();

async function main() {

}
main();

app.listen(3000, function(){
    console.log("Server has started");
})