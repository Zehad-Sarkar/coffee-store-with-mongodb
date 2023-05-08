const express = require("express");
const cors = require("cors");
require("dotenv").config();
const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");
const app = express();
const port = process.env.PORT || 5000;

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.7em2cfy.mongodb.net/?retryWrites=true&w=majority`;

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
});

async function run() {
  try {
    // Connect the client to the server	(optional starting in v4.7)
    await client.connect();
    const database = client.db("coffeeStoreDB");
    const coffeeCollection = database.collection("coffeeStore");

    //get from db to server
    app.get("/coffee", async (req, res) => {
      const cursor = coffeeCollection.find();
      const result = await cursor.toArray();
      res.send(result);
    });

    //update in db
    //first get
    app.get("/coffee/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
      const result = await coffeeCollection.findOne(query);
      res.send(result);
    });
    //second update
    app.put("/coffee/:id", async (req, res) => {
      const id = req.params.id;
      const filter = { _id: new ObjectId(id) };
      const option = { upsert: true };
      const updatedCofee = req.body;
      const updateCoffee = {
        $set: {
          coffee: updatedCofee.coffee,
          suplier: updatedCofee.suplier,
          quantity: updatedCofee.quantity,
          details: updatedCofee.details,
          taste: updatedCofee.taste,
          category: updatedCofee.category,
          photo: updatedCofee.photo,
        },
      };
      const result = await coffeeCollection.updateOne(filter,updateCoffee, option)
      res.send(result)
    });

    //send to db
    app.post("/coffee", async (req, res) => {
      const coffee = req.body;
      console.log(coffee);
      const result = await coffeeCollection.insertOne(coffee);
      res.send(result);
    });

    //delete items from db
    app.delete("/coffee/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
      const result = await coffeeCollection.deleteOne(query);
      res.send(result);
    });

    // Send a ping to confirm a successful connection
    await client.db("admin").command({ ping: 1 });
    console.log(
      "Pinged your deployment. You successfully connected to MongoDB!"
    );
  } finally {
    // Ensures that the client will close when you finish/error
    //comment under code for running database
    // await client.close();
  }
}
run().catch(console.dir);

//express midleware
app.use(cors());
app.use(express.json());

app.get("/", (req, res) => {
  res.send("Coffee store server running");
});

app.listen(port, (req, res) => {
  console.log(`coffee store server api running in port : ${port}`);
});
