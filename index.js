const express = require("express");
const multer = require("multer");
const path = require("path");
require("dotenv").config();
const cors = require("cors");

const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");
const app = express();
const port = process.env.PORT || 5000;

// middleware

app.use(cors());
app.use(express.json());
app.use("/uploads", express.static("uploads")); // Serve images
// upload photo

const storage = multer.diskStorage({
  destination: "uploads/",
  filename: (req, file, cb) => {
    cb(
      null,
      file.fieldname + "-" + Date.now() + path.extname(file.originalname)
    );
  },
});

const upload = multer({ storage: storage });
// uploads photo

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.npnkk.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0`;

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

    // app.put("/users/:id", async (req, res) => {
    //   const id = req.params.id;
    //   const updatedUser = req.body;
    //   console.log(updatedUser);
    //   const filter = { _id: new ObjectId(id) };
    //   const option = { upsert: true };
    //   const updated = {
    //     $set: {
    //       name: updatedUser.name,
    //       email: updatedUser.email,
    //     },
    //   };
    //   const result = await myColl.updateOne(filter, updated, option);
    //   res.send(result);
    // });
    // app.post("/users", upload.single("photo"), async (req, res) => {
    //   const user = req.body;
    //   console.log(user);
    //   const result = await myColl.insertOne(user);
    //   res.send(result);
    // });

    // app.put("/users/:id", upload.single("photo"), async (req, res) => {
    //   const id = req.params.id;
    //   const updatedUser = req.body;
    //   const filter = { _id: new ObjectId(id) };

    //   let updatedFields = {
    //     name: updatedUser.name,
    //     email: updatedUser.email,
    //   };

    //   if (req.file) {
    //     updatedFields.photoUrl = `/uploads/${req.file.filename}`; // New image
    //   } else {
    //     updatedFields.photoUrl = updatedUser.photoUrl; // Keep old image
    //   }

    //   const updated = { $set: updatedFields };
    //   const result = await myColl.updateOne(filter, updated);
    //   res.send(result);
    // });

    app.put("/users/:id", upload.single("photo"), async (req, res) => {
      const id = req.params.id;
      const updatedUser = req.body;
      const filter = { _id: new ObjectId(id) };

      // Get existing user from the database
      const existingUser = await myColl.findOne(filter);

      let updatedFields = {
        name: updatedUser.name,
        email: updatedUser.email,
        photoUrl: existingUser.photoUrl, // Keep the old image by default
      };

      if (req.file) {
        updatedFields.photoUrl = `/uploads/${req.file.filename}`; // Only update if a new file is uploaded
      }

      const updated = { $set: updatedFields };
      const result = await myColl.updateOne(filter, updated);
      res.send(result);
    });

    app.post("/users", upload.single("photo"), async (req, res) => {
      try {
        const { name, email } = req.body;
        const photoUrl = req.file ? `/uploads/${req.file.filename}` : null; // Store file path

        const user = { name, email, photoUrl }; // Save URL instead of file object
        console.log(user);
        const result = await myColl.insertOne(user);

        res.send(result);
      } catch (error) {
        console.error(error);
        res.status(500).send({ message: "Error adding user" });
      }
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
