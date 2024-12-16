import express from 'express';
import isAuthenticated from '../middlewares/isAuthenticated.js';
import { findFriends, sendRequest } from '../controllers/friends.controller.js';

const Router = express.Router();

Router.route('/findFriends').get(isAuthenticated,findFriends);
Router.route('/sendrequest/:id').post(isAuthenticated, sendRequest);


export default Router;