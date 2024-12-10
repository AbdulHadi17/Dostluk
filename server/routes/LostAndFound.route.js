import express from 'express';
import { getData } from '../controllers/LostAndFound.controller.js';

const Router = express.Router();

Router.route('/getData').get(getData);



export default Router;