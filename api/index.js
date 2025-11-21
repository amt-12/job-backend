const Router = require('express').Router();
const historyRoutes = require('../routes/history');
const fetchRoutes = require('../routes/fetch');

Router.use('/history', historyRoutes);
Router.use('/fetch', fetchRoutes);

module.exports = Router;
