import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import LostAndFound from './routes/LostAndFound.route.js';
import dotenv from 'dotenv';
import connectDB from './database/db.js';




dotenv.config({});

const app = express();
const PORT =  process.env.VITE_SERVER_PORT || 5000;

//Middlewares
app.use(express.json());
app.use(express.urlencoded({extended:true}));
app.use(cors());
app.use(cookieParser());


//Routes
app.use('/api/v1/LostAndFound', LostAndFound);


app.get('/',(req,res)=>{
    res.send('Hello World');
    console.log('Connected');
})

connectDB().then(()=>{

    app.listen(PORT, ()=>{
        console.log(`Server Listening on Port ${PORT}`)
    });
    


})






