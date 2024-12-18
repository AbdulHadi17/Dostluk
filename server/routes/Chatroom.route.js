import express from 'express';
import isAuthenticated from '../middlewares/isAuthenticated.js';
import { getChatrooms } from '../controllers/Chatroom.controller.js';

const Router = express.Router();

Router.route('/getchatrooms').get(isAuthenticated,getChatrooms);
Router.route('/').post(isAuthenticated);


export default Router;