const express = require('express')
const cors = require('cors')
require('dotenv').config()
const app = express()
const port = process.env.PORT || 5600;


// middleware
app.use(cors())
app.use(express.json())


const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.dzbhwpo.mongodb.net/?retryWrites=true&w=majority`;

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  }
});

async function run() {
  try {
    // Connect the client to the server	(optional starting in v4.7)
    await client.connect();

    // collection
    const featuredCollection = client.db('assignment-12').collection('featured')
    const testomonialCollection = client.db('assignment-12').collection('testomonial')
    const blogsCollection = client.db('assignment-12').collection('blog')
    const trainersCollection = client.db('assignment-12').collection('trainer')
    const newsLettersCollection = client.db('assignment-12').collection('newsLetters')
    const galleryCollection = client.db('assignment-12').collection('gallery')
    const classesCollection = client.db('assignment-12').collection('classes')

    // CRUD OPERATION  
    // featured related
    app.get('/featured', async(req, res)=>{
        const result = await featuredCollection.find().toArray()
        res.send(result)
    })

    //testomonial related
    app.get('/testomonial', async(req, res)=>{
        const result = await testomonialCollection.find().toArray()
        res.send(result)
    })

    // blogs related
    app.get('/blogs', async(req, res)=>{
        const result = await blogsCollection.find().toArray()
        res.send(result)
    })

    // trainer related
    app.get('/trainers', async(req, res)=>{
      const result = await trainersCollection.find().toArray()
      res.send(result)
    })

    // letter related
    app.post('/newsLetters', async(req, res)=>{
      const letter = req.body;
      const result = await newsLettersCollection.insertOne(letter)
      res.send(result)
    })

    app.get('/newsLetters', async(req, res)=>{
      const result = await newsLettersCollection.find().toArray()
      res.send(result)
    })

    // gallery related
    app.get('/gallery',async(req, res)=>{
      const result = await galleryCollection.find().toArray()
      res.send(result)
    })

    // classes related
    app.post('/classes', async(req, res)=>{
    const classes = req.body;
    const result = await classesCollection.insertOne(classes)
    res.send(result)
    })

    app.get('/classes', async(req, res)=>{
      const result = await classesCollection.find().toArray()
      res.send(result)
    })

    app.get('/classes/:id', async(req, res)=>{
      const id = req.params.id;
      const query = {_id: new ObjectId(id)}
      const result = await classesCollection.findOne(query)
      res.send(result);
    })


    // Send a ping to confirm a successful connection
    await client.db("admin").command({ ping: 1 });
    console.log("Pinged your deployment. You successfully connected to MongoDB!");
  } finally {
    // Ensures that the client will close when you finish/error
    // await client.close();
  }
}
run().catch(console.dir);


app.get('/', (req, res)=>{
    res.send('Assignment 12 server running')
})

app.listen(port, ()=>{
    console.log(`Server running ${port}`);
})