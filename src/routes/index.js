const { Router } = require('express');

const usersController = require('../controllers/users.controller')
const recordsController = require('../controllers/records.controller')
const reportsController = require('../controllers/reports.controller')
const router = Router();
const authToken = require('../middleware/auth');

router.get('/', (req, res) => res.send('Welcome'))

// Users Routes
router.post('/signup', usersController.signUp);
router.post('/login', usersController.logIn);
router.post('/users/create',[authToken.verifyToken], usersController.create);
router.put('/users/:id',[authToken.verifyToken], usersController.update);
router.delete('/users/:id',[authToken.verifyToken], usersController.delete);
router.get('/users/:id',[authToken.verifyToken], usersController.getUser);
router.get('/users',[authToken.verifyToken], usersController.getUsers);

// Records Routes
router.post('/records', [authToken.verifyToken], recordsController.createRecord);
router.put('/records/:recordId', [authToken.verifyToken], recordsController.updateRecord);
router.delete('/records/:recordId', [authToken.verifyToken], recordsController.deleteRecord);
router.get('/records', [authToken.verifyToken], recordsController.getAllRecords);
router.get('/records/:recordId', [authToken.verifyToken],recordsController.getRecordById);

// Reports Routes
router.get('/reports',[authToken.verifyToken], reportsController.getReportForUser);

module.exports = router;