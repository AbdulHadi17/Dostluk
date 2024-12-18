import express from 'express';
import isAuthenticated from '../middlewares/isAuthenticated.js';
import { createChatroom, getChatrooms, joinChatroom } from '../controllers/Chatroom.controller.js';

const Router = express.Router();

Router.route('/getchatrooms').get(isAuthenticated,getChatrooms);
Router.route('/createChatroom').post(isAuthenticated, createChatroom);
Router.route('/joinchatroom/:id').post(isAuthenticated, joinChatroom);


export default Router;