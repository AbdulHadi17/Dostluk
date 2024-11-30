import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';

const app = express();
const PORT = 3000;


//Middlewares
app.use(express.json());
app.use(express.urlencoded({extended:true}));
app.use(cors());
app.use(cookieParser());

app.get('/',(req,res)=>{
    res.send('Hello World');
})

app.listen(PORT, ()=>{
    console.log(`Server Listening on Port ${PORT}`)
})