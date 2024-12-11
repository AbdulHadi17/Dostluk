import express from 'express';
import { Register,Login,Logout } from '../controllers/user.controller.js';

const Router = express.Router();

Router.route('/register').post(Register);
Router.route('/Login').post(Login);
Router.route('/logout').get(Logout);


export default Router;