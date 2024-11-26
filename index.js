const express = require("express");
const cors = require("cors");
const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");
const app = express();
const port = process.env.PORT || 5000;

// middleware

app.use(cors());
app.use(express.json());

// mdnasimnirob4650
// bKlA4zd3U7qoaYdG

const uri =
  "mongodb+srv://mdnasimnirob4650:bKlA4zd3U7qoaYdG@cluster0.npnkk.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0";

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
    const myDB = client.db("myDB");
    const myColl = myDB.collection("users");
    // Connect the client to the server	(optional starting in v4.7)
    await client.connect();

    app.get("/users", async (req, res) => {
      const cursor = myColl.find();
      const resuls = await cursor.toArray();
      res.send(resuls);
    });

    app.get("/users/:id", async (req, res) => {
      const id = req.params.id;

      const query = { _id: new ObjectId(id) };
      const user = await myColl.findOne(query);
      res.send(user);
    });

    app.put("/users/:id", async (req, res) => {
      const id = req.params.id;
      const updatedUser = req.body;
      console.log(updatedUser);
      const filter = { _id: new ObjectId(id) };
      const option = { upsert: true };
      const updated = {
        $set: {
          name: updatedUser.name,
          email: updatedUser.email,
        },
      };
      const result = await myColl.updateOne(filter, updated, option);
      res.send(result);
    });
    app.post("/users", async (req, res) => {
      const user = req.body;
      console.log(user);
      const result = await myColl.insertOne(user);
      res.send(result);
    });

    app.delete("/users/:id", async (req, res) => {
      const id = req.params.id;
      console.log("delete data", id);
      const query = { _id: new ObjectId(id) };
      const deleteResult = await myColl.deleteOne(query);
      res.send(deleteResult);
    });

    // Send a ping to confirm a successful connection
    await client.db("admin").command({ ping: 1 });
    console.log(
      "Pinged your deployment. You successfully connected to MongoDB!"
    );
  } finally {
    // Ensures that the client will close when you finish/error
    // await client.close();
  }
}
run().catch(console.dir);

// const users = [
//   { id: 1, name: "asha", email: "adhaa@gmail.com" },
//   { id: 2, name: "nabila", email: "soniya@gmail.com" },
//   { id: 3, name: "soniya", email: "aha@gmail.com" },
//   { id: 4, name: "sany", email: "sany@gmail.com" },
// ];

app.get("/", (req, res) => {
  res.send("my first server");
});

// app.get("/users", (req, res) => {
//   res.send(users);
// });

// app.post("/users", (req, res) => {
//   console.log("hidding the server");
//   console.log(req.body);
//   const newUser = req.body;
//   newUser.id = users.length + 1;
//   users.push(newUser);
//   res.send(newUser);
// });

app.listen(port, () => {
  console.log(`server is running port: ${port}`);
});
