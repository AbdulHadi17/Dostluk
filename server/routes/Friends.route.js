import express from 'express';
import isAuthenticated from '../middlewares/isAuthenticated.js';
import { acceptFriendRequest, findFriends, getFriends, sendRequest } from '../controllers/friends.controller.js';

const Router = express.Router();

Router.route('/findFriends').get(isAuthenticated,findFriends);
Router.route('/sendrequest/:id').post(isAuthenticated, sendRequest);
Router.route('/getFriends').get(isAuthenticated, getFriends);
Router.route('/acceptFriendRequest/:id').post(isAuthenticated, acceptFriendRequest);


export default Router;