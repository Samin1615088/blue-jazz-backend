const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
require('dotenv').config();
const MongoClient = require('mongodb').MongoClient;
const ObjectId = require('mongodb').ObjectId;


const app = express();
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));

const port = 3000
const password = '';
//mongodb connection
const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.emkeh.mongodb.net/myFirstDatabase?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });

app.get('/', (req, res) => {
    res.send('Hello World!')
})

//mongodb >> >>
client.connect(err => {
    const servicesCollection = client.db("blueJazzDb").collection("services");
    console.log("mongodb connected successfully");
    client.close();
});
//mongodb << <<


app.listen(() => {
    const currentPort = process.env.PORT || 5000;
    console.log(`Example app listening at http://localhost:${currentPort}`)
})