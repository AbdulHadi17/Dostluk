import express from 'express';
import { getDepartments } from '../controllers/department.controller.js';

const Router = express.Router();

Router.route('/getDepartments').get(getDepartments);

export default Router;