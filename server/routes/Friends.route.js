import express from 'express';
import isAuthenticated from '../middlewares/isAuthenticated.js';
import { findFriends, getFriends, sendRequest } from '../controllers/friends.controller.js';

const Router = express.Router();

Router.route('/findFriends').get(isAuthenticated,findFriends);
Router.route('/sendrequest/:id').post(isAuthenticated, sendRequest);
Router.route('/getFriends').get(isAuthenticated, getFriends);


export default Router;