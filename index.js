const bodyParser = require('body-parser');
const cors = require('cors');
require('dotenv').config();
const MongoClient = require('mongodb').MongoClient;
const ObjectId = require('mongodb').ObjectId;
const express = require('express')
const fileUpload = require('express-fileupload');
const fs = require('fs-extra');

const app = express()
app.use(cors());
app.use(bodyParser.json());
app.use(express.static('serviceimages'));
app.use(fileUpload());

const port = process.env.PORT || 5000
//mongodb connection
const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.emkeh.mongodb.net/myFirstDatabase?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });

app.get('/', (req, res) => {
    res.send('Hello World!')
})


//mongodb >> >> >> >>
client.connect(err => {
    const servicesCollection = client.db("blueJazzDb").collection("allServices");
    const customerTestimonialsCollection = client.db("blueJazzDb").collection("customerTestimonials");
    const orderedServicesCollection = client.db("blueJazzDb").collection("allOrderedServices");
    const adminCollection = client.db("blueJazzDb").collection("admins");
    console.log("mongodb connected successfully");

    // get all Services from mongodb >>>> 
    app.get('/allServices', (req, res) => {
        console.log("get ALL-SERVICES req", req);
        servicesCollection.find({})
            .toArray((err, documents) => {
                console.log(err, documents);
                res.send(documents);
            })
    })
    // get all Services from mongodb <<<<

    // get all Testimonials from mongodb >>>> 
    app.get('/allTestimonials', (req, res) => {
        console.log("getALLTESTIMONIALS req", req);
        customerTestimonialsCollection.find({})
            .toArray((err, documents) => {
                console.log(err, documents);
                res.send(documents);
            })
    })
    // get all Testimonials from mongodb <<<<

    // get orderedService from mongodb >>>> 
    app.get('/getOrderedService/:serviceId', (req, res) => {
        console.log("get orderedService req", req.params.serviceId, ObjectId(req.params.serviceId));
        const id = ObjectId(req.params.serviceId);
        servicesCollection.find({ _id: id })
            .toArray((err, documents) => {
                console.log('error', err, 'documents', documents[0]);
                res.send(documents[0]);
            })
    })
    // get orderedService from mongodb <<<<

    // post orderedService on mongodb>>>> 
    app.post('/processOrder', (req, res) => {
        const orderedService = req.body
        console.log("post orderedService req client->*server->mongodb", orderedService);

        orderedServicesCollection
            .insertOne(orderedService)
            .then(result => {
                console.log(result);
                res.send(result.insertedCount > 0);
            }).catch(error => console.log(error))
    })
    // post orderedService on mongodb<<<<<








    //code for some troubling section>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>
    //get uesr ordered service>>
    app.get('/getUserServices/:userEmail', (req, res) => {
        const email = req.params.userEmail;
        console.log('getUserServices', { email });
        orderedServicesCollection.find({ email })
            .toArray((err, documents) => {
                console.log('error', err, 'documents', documents);
                res.send(documents);
            })
    })
    //get uesr ordered service<<

    //get admin ordered service>>
    app.get('/getAdminServices', (req, res) => {
        console.log('getAdminServices');
        orderedServicesCollection.find()
            .toArray((err, documents) => {
                console.log('error', err, 'documents', documents);
                res.send(documents);
            })
    })
    //get admin ordered service<<



    // post user review on mongodb>>>> 
    app.post('/addReview', (req, res) => {
        const review = req.body
        console.log("post user review client->*server->mongodb", review);

        customerTestimonialsCollection
            .insertOne(review)
            .then(result => {
                console.log('result', result);
                res.send(result.insertedCount > 0);
            }).catch(error => console.log(error))
    })
    // post user review on mongodb<<<< 

    // post add new Admin on mongodb>>>> 
    app.post('/addAdmin', (req, res) => {
        const newAdmin = req.body
        console.log("post add new Admin client->*server->mongodb", newAdmin);

        adminCollection
            .insertOne(newAdmin)
            .then(result => {
                console.log('result', result);
                res.send(result.insertedCount > 0);
            }).catch(error => console.log(error))
    })
    // post add new Admin on mongodb<<<< 


    app.post('/isAdmin', (req, res) => {
        const email = req.body.email;
        adminCollection.find({ email: email })
            .toArray((err, doctors) => {
                res.send(doctors.length > 0);
            })
    })


    app.post('/addServices', (req, res) => {
        const serviceImg = req.files.file;
        const serviceName = req.body.serviceName;
        const serviceDescription = req.body.serviceDescription;
        const price = req.body.price;
        console.log(" in server ", serviceImg, serviceName, serviceDescription, price);
        const filePath = `${__dirname}/serviceimages/${serviceImg.name}`;
        serviceImg.mv(filePath, err => {
            if (err) {
                console.log(err);
                return res.status(500).send({ msg: 'failed to upload image' })
            }
            const newImg = fs.readFileSync(filePath);
            const encImg = newImg.toString();

            const image = {
                contentType: req.files.file.mimetype,
                size: req.files.file.size,
                img: Buffer(encImg, 'base64')
            };
            servicesCollection.insertOne({ serviceImg: image, serviceName, serviceDescription, price })
                .then(result => {
                    fs.remove(filePath, error => {
                        if (error) {
                            console.log(error)
                        }
                        res.send(result.insertedCount > 0)
                    })

                })
            // return res.send({name: serviceImg.name, path:`/${serviceImg.name}`})
        })
    })
    // app.post('/addServices', (req, res) => {
    //     const serviceImg = req.files.file;
    //     const serviceName = req.body.serviceName;
    //     const serviceDescription = req.body.serviceDescription;
    //     const price = req.body.price;
    //     console.log(" in server ", serviceImg, serviceName, serviceDescription, price);

    //     serviceImg.mv(`${__dirname}/serviceimages/${serviceImg.name}`, err => {
    //         if(err){
    //             console.log(err);
    //             return res.status(500).send({msg: 'failed to upload image'})
    //         }
    //         return res.send({name: serviceImg.name, path:`/${serviceImg.name}`})
    //     })
    // })
    //code for some troubling section<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<


});
//mongodb << << << <<



app.listen(port, () => {
    console.log(`Example app listening at http://localhost:${port}`)
})