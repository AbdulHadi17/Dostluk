import express from 'express';
import isAuthenticated from '../middlewares/isAuthenticated.js';


const Router = express.Router();

Router.route('/getUserChatroomsAndChats').get(isAuthenticated);
Router.route('/getUserChatroomsAndChats').post(isAuthenticated);


export default Router;