const express = require("express");
const cors = require("cors");
require("dotenv").config();
const stripe = require("stripe")(process.env.STRIPE_SECRET);
const jwt = require("jsonwebtoken");
const app = express();
const port = process.env.PORT || 5600;

// middleware
app.use(cors());
app.use(express.json());

const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");
const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.dzbhwpo.mongodb.net/?retryWrites=true&w=majority`;

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

    // collection
    const featuredCollection = client
      .db("assignment-12")
      .collection("featured");
    const testomonialCollection = client
      .db("assignment-12")
      .collection("testomonial");
    const blogsCollection = client.db("assignment-12").collection("blog");
    const trainersCollection = client.db("assignment-12").collection("trainer");
    const newsLettersCollection = client
      .db("assignment-12")
      .collection("newsLetters");
    const galleryCollection = client.db("assignment-12").collection("gallery");
    const classesCollection = client.db("assignment-12").collection("classes");
    const communityCollection = client
      .db("assignment-12")
      .collection("community");
    const usersCollection = client.db("assignment-12").collection("users");
    const paymentsCollection = client.db("assignment-12").collection("payments");

    // CRUD OPERATION
    //auth related
    app.post("/jwt", async (req, res) => {
      const user = req.body;
      const token = jwt.sign(user, process.env.JSON_WEB_TOKEN, {
        expiresIn: "365d",
      });
      res.send({ token });
    });

    // jwt middleware
    const verifyToken = (req, res, next) => {
      // console.log(req.headers.authorization);
      if (!req.headers.authorization) {
        return res.status(401).send({ message: "forbidden access " });
      }
      const token = req.headers.authorization.split(" ")[1];
      console.log(token);
      jwt.verify(token, process.env.JSON_WEB_TOKEN, (err, decoded) => {
        if (err) {
          return res.status(401).send({ message: "forbidden access" });
        }
        req.decoded = decoded;
        next();
      });
    };

    // verify admin
    const verifyAdmin = async (req, res, next) => {
      const email = req.decoded?.email;
      const query = { email: email };
      const user = await usersCollection.findOne(query);
      const isAdmin = user?.role === "admin";
      if (!isAdmin) {
        return res.status(401).send({ message: "forbidden access" });
      }
      next();
    };

    // salary related
    app.post('/create-peyment-intent', async(req,res)=>{
      const {salary} = req.body;
      const amount = parseInt(salary * 100)

      const paymentIntent =  await stripe.paymentIntents.create({
        amount: amount,
        currency: 'usd',
        payment_method_types: ["card"],
      })
      console.log(98, paymentIntent);
      res.send({
        clientSecret: paymentIntent.client_secret,
      })
    })

    // payment related
    app.post('/payments', async(req, res)=>{
      const payment = req.body;
      const result = await paymentsCollection.insertOne(payment)
      res.send(result)
    })

    app.get('/payments', async(req,res)=> {
      const result = await paymentsCollection.find().toArray()
      res.send(result)
    })

    app.patch('/payments/:id', async(req,res)=>{
      const id = req.params.id;
      const query = {_id: new ObjectId(id)}
      const payment = req.body;
      const updateStatus = {
        $set:{
          status:payment.status
        }
      }
      const result = await paymentsCollection.updateOne(query, updateStatus)
      res.send(result)
    })

    //users related
    app.post("/users", async (req, res) => {
      const user = req.body;
      // console.log(user, user?.email);
      const query = { email: user?.email };
      const isExisting = await usersCollection.findOne(query);
      if (isExisting) {
        return res.send({ message: "user already lodded", insertedId: null });
      }
      const result = await usersCollection.insertOne(user);
      res.send(result);
    });

    app.get("/users", verifyToken, verifyAdmin, async (req, res) => {
      const result = await usersCollection.find().toArray();
      res.send(result);
    });

    app.get("/users/:email", verifyToken, async (req, res) => {
      const email = req.params.email;
      if (email !== req.decoded?.email) {
        return res.status(401).send({ message: "forbidden access" });
      }
      const query = { email: email };
      const user = await usersCollection.findOne(query);
      let admin = false;
      if (user) {
        admin = admin?.role === "admin";
      }
      res.send({ admin });
    });
    // app.get('/users/:email', verifyToken, async(req, res)=>{
    //   const email = req.params.email;
    //   if(email !== req.decoded?.email){
    //     return res.status(401).send({message: 'forbidden access'})
    //   }
    //   const query = {email: email}
    //   const user = await usersCollection.findOne(query)
    //   let trainer = false;
    //   if(user){
    //     trainer = trainer?.role === 'trainer'
    //   }
    //   res.send({trainer})
    // })

    // featured related
    app.get("/featured", async (req, res) => {
      const result = await featuredCollection.find().toArray();
      res.send(result);
    });

    //testomonial related
    app.get("/testomonial", async (req, res) => {
      const result = await testomonialCollection.find().toArray();
      res.send(result);
    });

    // blogs related
    app.get("/blogs", async (req, res) => {
      const result = await blogsCollection.find().toArray();
      res.send(result);
    });

    // trainer related
    app.get("/trainers", async (req, res) => {
      const result = await trainersCollection.find().toArray();
      res.send(result);
    });
    app.get("/trainers/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
      const result = await trainersCollection.findOne(query);
      res.send(result);
    });

    // letter related
    app.post("/newsLetters", async (req, res) => {
      const letter = req.body;
      const result = await newsLettersCollection.insertOne(letter);
      res.send(result);
    });

    app.get("/newsLetters", async (req, res) => {
      const result = await newsLettersCollection.find().toArray();
      res.send(result);
    });

    app.delete("/newsLetters/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
      const result = await newsLettersCollection.deleteOne(query);
      res.send(result);
    });

    // gallery related
    app.get("/gallery", async (req, res) => {
      const result = await galleryCollection.find().toArray();
      res.send(result);
    });

    // classes related
    app.post("/classes", async (req, res) => {
      const classes = req.body;
      const result = await classesCollection.insertOne(classes);
      res.send(result);
    });

    app.get("/classes", async (req, res) => {
      const result = await classesCollection.find().toArray();
      res.send(result);
    });

    app.get("/classes/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
      const result = await classesCollection.findOne(query);
      res.send(result);
    });

    // community related
    app.post("/community", async (req, res) => {
      const post = req.body;
      const result = await communityCollection.insertOne(post);
      res.send(result);
    });

    app.get("/community", async (req, res) => {
      const page = parseInt(req.query.page);
      const size = parseInt(req.query.size);
      console.log(page, size);
      const result = await communityCollection
        .find()
        .skip(page * size)
        .limit(size)
        .toArray();
      res.send(result);
    });

    app.get("/pageCount", async (req, res) => {
      const count = await communityCollection.estimatedDocumentCount();
      res.send({ count });
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

app.get("/", (req, res) => {
  res.send("Assignment 12 server running");
});

app.listen(port, () => {
  console.log(`Server running ${port}`);
});
