import {v2 as cloudinary} from 'cloudinary';
import dotenv from 'dotenv';

dotenv.config({});

cloudinary.config({
cloud_name:process.env.VITE_CLOUD_NAME,
api_key:process.env.VITE_API_KEY,
api_secret:process.env.VITE_API_SECRET
});

export default cloudinary;