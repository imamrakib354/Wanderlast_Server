import express from 'express'
import 'dotenv/config'
import { MongoClient, ObjectId } from 'mongodb';
import cors from 'cors';

const app  = express();
const port = process.env.PORT || 5000;

let destinationCollectionPromise;

function getDestinationCollection() {
  if (!destinationCollectionPromise) {
    destinationCollectionPromise = (async () => {
      if (!process.env.MONGODB_URI) {
        throw new Error('MONGODB_URI is not set');
      }
      const client = new MongoClient(process.env.MONGODB_URI);
      await client.connect();
      console.log('You successfully connected to MongoDB!');
      return client.db('wanderlast').collection('destination');
    })().catch((err) => {
      destinationCollectionPromise = undefined;
      console.error('MongoDB connection failed:', err);
      throw err;
    });
  }
  return destinationCollectionPromise;
}

app.use(cors());
app.use(express.json());

app.get('/', (req,res) => {
    res.send({message: 'Server is running fine!'})
})

app.post("/add-destination", async (req, res) => {
  const destinationCollection = await getDestinationCollection();
  const data = req.body;
  const result = await destinationCollection.insertOne(data);
  res.send(result);
});

app.get("/destinations", async (req, res) => {
  const destinationCollection = await getDestinationCollection();
  const result = await destinationCollection.find().toArray();
  res.send(result);
});

app.get("/destinations/:id", async (req, res) => {
  const destinationCollection = await getDestinationCollection();
  const { id } = req.params;
  const result = await destinationCollection.findOne({
    _id: new ObjectId(id),
  });
  res.send(result);
});

app.patch("/destination/:id", async (req, res) => {
  const destinationCollection = await getDestinationCollection();
  const { id } = req.params;
  const data = req.body;
  const result = await destinationCollection.updateOne(
    { _id: new ObjectId(id) },
    { $set: data }
  );
  res.json(result);
});

app.delete("/destination/:id", async (req, res) => {
  const destinationCollection = await getDestinationCollection();
  const { id } = req.params;
  const result = await destinationCollection.deleteOne({
    _id: new ObjectId(id)
  });
  res.json(result);
});

if (!process.env.VERCEL) {
  app.listen(port, () => {
    console.log(`Server is running at ${port}`);
  });
}

export default app;
