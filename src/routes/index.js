const { Router } = require('express');
const controllers = require('../controllers');

const router = Router();
const authToken = require('../middleware/auth');
// const authorization = require('../middleware/authorization')
router.get('/', (req, res) => res.send('Welcome'))
router.post('/signup', controllers.signUp);
router.post('/login', controllers.logIn);
router.post('/create',[authToken.verifyToken], controllers.create);
router.post('/records',[authToken.verifyToken], controllers.createRecord);
router.put('/records/:recordId',[authToken.verifyToken], controllers.updateRecord);
router.delete('/records/:recordId',[authToken.verifyToken], controllers.deleteRecord);
router.get('/records', controllers.getAllRecords);
router.get('/records/:recordId', controllers.getRecordById);



module.exports = router;