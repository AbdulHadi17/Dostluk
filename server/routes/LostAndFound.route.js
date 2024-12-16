import express from 'express';
import {getLostAndFoundItems } from '../controllers/LostAndFound.controller.js';
import isAuthenticated from '../middlewares/isAuthenticated.js';


const Router = express.Router();

Router.route('/getLostAndFoundItems').get(isAuthenticated,getLostAndFoundItems);



export default Router;