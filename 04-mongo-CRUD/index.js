const express = require('express');
const { ObjectId } = require("mongodb")

const hbs = require('hbs');
const waxOn = require("wax-on")
waxOn.setLayoutPath("./views/layouts")
waxOn.on(hbs.handlebars);
const helpers = require('handlebars-helpers')({
    "handlebars": hbs.handlebars
})

require("dotenv").config();

const app = express();
app.set("view engine", "hbs");
// req.body will be always be undefined we app.use express.urlencoded
app.use(express.urlencoded({
    'extended': false
}))

const { connect } = require("./mongoUtil") // using require

// it is a global constant
const COLLECTION = "foodRecords";


async function main() {
    const db = await connect(process.env.MONGO_URL, "sctp_cico")
    // Display the form
    app.get("/", async function (req, res) {
        // search bar
        const { foodName, minCalories } = req.query;
        let searchCriteria = {}

        let searchByFoodNameOrTags = []


        if (foodName) {
            searchByFoodNameOrTags["$or"].push({
                foodName: {
                    "$regenx": foodName, "$options": "i"
                }
            })
            searchByFoodNameOrTags["$or"].push({
                "tags": foodName
            })
            searchCriteria["$or"] = searchByFoodNameOrTags

        }

        if (minCalories) {
            searchCriteria.calories = {
                "$gte": parseInt(minCalories)
            }
        }

        // We want to retrieve the documents from the collections
        // and convert it to an array of JSON objects
        const foodRecords = await db.collection(COLLECTION)
            .find()
            .toArray();
        res.render('allFoodRecords', {
            'foodRecords': foodRecords,
            "searchCritera": { "foodName": foodName },
            "minCalories": minCalories,
            "maxCalories": maxCalories
        })

    })



    app.get("/add-food", function (req, res) {
        res.render("add-food")
        app.post("/add-food", async function (req, res) {
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
    app.get("/delete-food/:foodRecordId", async function (req, res) {
        const foodRecord = await db.collection(COLLECTION).findOne({ // findOne will give you one result instead of an array
            "_id": new ObjectId(req.params.foodRecordId)
        });

        res.render("confirm-delete", {
            foodRecord
        })
    })

    app.post("/delete-food/:foodRecordId", async function (req, res) {
        await db.collection(COLLECTION).deleteOne({
            "_id": new ObjectId(req.params.foodRecordId)
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
        }, {
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

    // Add 
    app.get("/add-note/:foodid", function (req, res) {
        try {
            const foodId = req.params.foodid;
            const foodRecord = db.collections(COLLECTION).findOne({
                "_id": new ObjectId(foodId)
            });
            if (foodRecord) {
                res.render('add-note', {
                    "food": food
                })
            } else {
                // error handling
                res.status(404)
                res.send("Food record not found")

            }
        } catch (e) {
            // catching the exception (when there's an error, the program counter
            // will move in the first line the catch block)
            res.status(500)
            res.send("Sorry something went wrong. Please try again later")
        }
    })

    app.post("/add-note/:foodid", async function (req, res) {
        const foodId = req.params.foodid;
        const noteContent = req.body.noteContent;
        const response = await db.collection(COLLECTION).updateOne({
            "_id": new ObjectId(foodId)
        }, {
            "$push": {
                "notes": {
                    "_id": new ObjectId(),
                    "content": noteContent
                }
            }
        })
        res.redirect("/")
    })

    // 
    app.get("/view-food/:foodid", async (req, res) => {
        const foodRecord = await db.collection(COLLECTION).findOne({
            "_id": new ObjectId(req.params.foodid)
        })
    })

    // delete note
    app.get("/food/:foodid/delete-note/noteid", async (req, res) => {
        const { foodid, noteid } = req.params;
        await db.collection(COLLECTION).deleteOne({
            "_id": new ObjectId(foodid)
        }, {
            "$pull": {
                "notes": {
                    "_id": new ObjectId(noteid)
                }
            }
        })
        res.redirection('/view-food/' + foodid)
    })

    // Edit note by getting first 
    app.get("/food/:foodid/edit-note/:noteid", async (req, res) => {
        const { foodid, noteid } = req.params;
        const allNotes = await db.collection(COLLECTION).findOne({
            "_id": new ObjectId(foodid)
        }, {
            "projection": {
                "foodName": 1,
                "notes": {
                    "$elemMatch": {
                        "_id": new ObjectId(noteid)
                    }
                }
            }
        })
        res.send('/view-food/' + foodid)
    })

    // Edit note when posting


} // End of main()



main();



// server starting

app.listen(3000, function () {
    console.log("Server has started");
})