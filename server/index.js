import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import LostAndFound from './routes/LostAndFound.route.js';
import dotenv from 'dotenv';
import connectDB from './database/db.js';
import User from './routes/User.route.js';
import Department from './routes/department.route.js'

dotenv.config({});

const app = express();
const PORT =  process.env.VITE_SERVER_PORT || 5000;

const corsOptions = {
    origin: 'http://localhost:5173', // Allow only this origin
    methods: 'GET,POST,PUT,DELETE', // Allow specific methods
    credentials: true, // Allow credentials (cookies, HTTP authentication)
  };
  
  // Enable CORS with the above options
  app.use(cors(corsOptions));

//Middlewares
app.use(express.json());
app.use(express.urlencoded({extended:true}));
app.use(cookieParser());


//Routes
app.use('/api/v1/LostAndFound', LostAndFound);
app.use('/api/v1/user', User);
app.use('/api/v1/department',Department);


app.get('/',(req,res)=>{
    res.send('Hello World');
    console.log('Connected');
})

connectDB().then(()=>{

    app.listen(PORT, ()=>{
        console.log(`Server Listening on Port ${PORT}`)
    });
    


})






