import express from 'express';
import isAuthenticated from '../middlewares/isAuthenticated.js';
import { getAllInterests, getCategoriesAndInterests } from '../controllers/categoriesAndInterests.controller.js';

const Router = express.Router();

Router.route('/getCategoriesAndInterests').get(isAuthenticated ,getCategoriesAndInterests);
Router.route('/getAllInterests').get(isAuthenticated,getAllInterests);


export default Router;