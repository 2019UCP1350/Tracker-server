require("./models/User");
require("./models/tracks");
const express=require('express');
const mongoose=require('mongoose');
const authRoutes=require('./routes/authroutes');
const dotenv = require("dotenv");
dotenv.config();
const reqAuth=require('./middlewares/reqAuth');
const trackRoutes=require('./routes/trackRoutes');
const bodyParser=require('body-parser'); // module to convert the json data into javascript object

const mongoUri=
`mongodb+srv://${process.env.DB_NAME}:${process.env.DB_PASSWORD}@login.sfkbg.mongodb.net/Tracker?retryWrites=true&w=majority`;

mongoose.connect(mongoUri);      // creating a mongoose instance	
                               
mongoose.connection.on('connected',()=>{            // use to check if we are connected or not
	console.log('connected to mongo instance');
});

mongoose.connection.on('error',(err)=>{
	console.error('Error connecting mongoose',err); // use to find the error
});

const app=express();			// creating an instance of express
app.use(bodyParser.json());
app.use(authRoutes);			// used to make all request handle to get tied to our main express application
app.use(trackRoutes);

app.get('/',reqAuth,(req,res)=>{res.send(`Your email: ${req.user.email}`)});   // making API request 

app.listen(process.env.PORT||3000,()=>{ console.log("Listening on port 3000")}); // telling computer on which port to receive the response