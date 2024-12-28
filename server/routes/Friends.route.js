import express from 'express';
import isAuthenticated from '../middlewares/isAuthenticated.js';
import { acceptFriendRequest, declineFriendRequest, findFriends, getFriendRequests, getFriends, sendRequest } from '../controllers/friends.controller.js';

const Router = express.Router();

Router.route('/findFriends').get(isAuthenticated,findFriends);
Router.route('/sendrequest/:id').post(isAuthenticated, sendRequest);
Router.route('/getFriends').get(isAuthenticated, getFriends);
Router.route('/getFriendRequests').get(isAuthenticated, getFriendRequests);
Router.route('/acceptFriendRequest/:id').post(isAuthenticated, acceptFriendRequest);
Router.route('/declineFriendRequest/:id').post(isAuthenticated, declineFriendRequest);


export default Router;