import express from 'express';
import isAuthenticated from '../middlewares/isAuthenticated.js';
import { deleteMessage, getFullChat, sendMessage } from '../controllers/Message.controller.js';


const Router = express.Router();

Router.route('/sendMessage/:id').post(isAuthenticated,sendMessage);
Router.route('/getFullChat/:id').get(isAuthenticated,getFullChat);
Router.route('/deleteMessage/:id').delete(isAuthenticated,deleteMessage);


export default Router;