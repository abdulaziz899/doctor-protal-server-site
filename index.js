//npm install nodemon mongodb express cors body-parser

const express = require('express');
const bodyParser = require('body-parser');
const fileUpload = require('express-fileupload');
const MongoClient = require('mongodb').MongoClient;
const cors=require('cors');
require('dotenv').config();
const ObjectId=require('mongodb').ObjectId;



const app = express();
app.use(bodyParser.json());
app.use(cors());
app.use(express.static('doctors'));
app.use(fileUpload());

const port =process.env.PORT || 4002;


const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.w8vla.mongodb.net/${process.env.DB_NAME}?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });

app.get('/', (req, res) => {
  res.send('Hello World!')
})



client.connect(err => {
  const collection = client.db("DoctorProtal").collection("schedule");
  const doctorCollection = client.db("DoctorProtal").collection("doctors");
  console.log('database connected ');


  app.post('/addAppointment',(req,res)=>{
      const appointment=req.body;
      collection.insertOne(appointment)
      .then(result=>{
          console.log(result);
          res.send(result.insertedCount>0)
      })
  });

app.get('/appointments',(req,res)=>{
  collection.find({})
  .toArray((err,documents)=>{
    console.log(err,documents);
    res.send(documents)
  })
});

app.post('/appointmentByDate', (req, res) => {
  const date = req.body;
  const email = req.body.email;
  doctorCollection.find({ email: email })
      .toArray((err, doctors) => {
          if (doctors.length === 0) {
              collection.find({email:email})
              .toArray((err, documents) => {
                  console.log(email, date.date, doctors, documents)
                  res.send(documents);
              })
          }
          else if (doctors.length>0) {
            collection.find({})
              .toArray((err, documents) => {
                  res.send(documents);
              })
          }
      })
})

  app.get('/appointmentByDate',(req,res)=>{
    const email=req.query.email;
    collection.find({email:email})
    .toArray((err,documents)=>{
        res.send(documents);
    })
});

app.post('/addDoctor',(req,res)=>{
  const doctor=req.body;
  console.log(doctor);
doctorCollection.insertOne(doctor)
    .then(result => {
      console.log(result);
        res.send(result.insertedCount>0);
    })
});

app.get('/doctors', (req, res) => {
  doctorCollection.find({})
      .toArray((err, documents) => {
        console.log(err,documents)
          res.send(documents);
      })
});

app.post('/isDoctor',(req,res)=>{
  const email=req.body.email;
  doctorCollection.find({email: email})
  .toArray((err,doctor)=>{
  res.send(doctor.length>0);
  })
})


app.delete('/delete/:id',(req,res)=>{
  doctorCollection.deleteOne({_id:ObjectId(req.params.id)})
  .then(result=>{
   console.log(result);
   res.send(result.deletedCount>0)
  })
})

});


app.listen(port)