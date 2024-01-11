const express = require('express');
const {ObjectId} = require("mongodb")

const hbs = require('hbs');
const waxOn = require("wax-on")
waxOn.setLayoutPath("./views/layouts")
waxOn.on(hbs.handlebars);
const helpers = require('handlebars-helpers')({
    "handlebars":hbs.handlebars
})

require("dotenv").config();

const app = express();
app.set("view engine", "hbs");
// req.body will be always be undefined we app.use express.urlencoded
app.use(express.urlencoded({
    'extended': false
}))

const {connect} = require("./mongoUtil") // using require

// it is a global constant
const COLLECTION = "foodRecords";


async function main() {
const db = await connect(process.env.MONGO_URL, "sctp_cico")
console.log("Database connected")
// Display the form
app.get("/",async function(req, res){
// We want to retrieve the documents from the collections
        // and convert it to an array of JSON objects
        const foodRecords = await db.collection(COLLECTION)
                                    .find()
                                    .toArray();
        res.render('allFoodRecords',{
            'foodRecords': foodRecords
        })

})



app.get("/add-food",function(req, res){
    res.render("add-food")
    app.post("/add-food", async function(req, res){
        console.log(req.body);
        const foodName = req.body.foodName
        const calories = req.body.calories
        let tags = req.body.tags;
        if (tags) {
            // check if tags is an array or a string
            if (!Array.isArray(tags)) {
                tags = [tags]
            }
        } else {
            tags = [];
        }
        const results = await db.collection(COLLECTION).insertOne({
            "foodName": foodName,
            "calories": Number(calories),
            "tags": tags
        })
        console.log(results);
        res.redirect("/")// nothing for now
    })
})

// Delete
app.get("/delete-food/:foodRecordId", async function(req, res){
    const foodRecord = await db.collection(COLLECTION).findOne({ // findOne will give you one result instead of an array
        "_id": new ObjectId(req.params.foodRecordId)
    });

    res.render("confirm-delete",{
        foodRecord
    })
})

app.post("/delete-food/:foodRecordId", async function(req, res){
await db.collection(COLLECTION).deleteOne({
    "_id":new ObjectId(req.params.foodRecordId)
})
res.redirect("/")
})

//Update 
app.get("/update-food/:foodRecordId", async function (req, res) {
    // findOne will return one result instead of an array
    const foodRecord = await db.collection(COLLECTION).findOne({
        "_id": new ObjectId(req.params.foodRecordId)
    });

    res.render("update-food", {
        foodRecord
    })

})

//Update is like creating just a bit different
app.post("/update-food/:foodRecordId", async function (req, res) {
    // anything retrieved is from req.body is a string, not number
    const foodName = req.body.foodName;
    const calories = req.body.calories;
    let tags = req.body.tags;
    if (tags) {
        // check if tags is already an array or a string?
        if (!Array.isArray(tags)) {
            tags = [tags];
        }
    } else {
        // if tag is undefined set to an empty array (meaning no tags selected)
        tags = [];
    }

    const results = await db.collection(COLLECTION).updateOne({
        "_id": new ObjectId(req.params.foodRecordId)
    },{
        //Changes to $set
       "$set": {
        "foodName": foodName,
        "calories": Number(calories),
        "tags": tags
       }    
    });
    console.log(results);

    res.redirect("/");
})


}
main();

//

app.listen(3000, function(){
    console.log("Server has started");
})