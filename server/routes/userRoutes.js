const express = require('express');
const { createUser, getUsers, getUserById, updateUser, deleteUser, loginUser, resetPassword, forgotPassword, googleAuth, facebookAuth } = require('../controllers/userControllers');

const router = express.Router();

// CRUD Routes
router.post('/createUser', createUser);       
router.get('/getUsers', getUsers);          
router.get('/getUser:id', getUserById);    
router.put('/updateUser:id', updateUser);    
router.delete('/deleteUser:id', deleteUser);  
router.post("/resetpassword", resetPassword);
router.post('/forgot-password', forgotPassword);
router.post('/login', loginUser);

// OAuth Routes
router.post('/auth/google', googleAuth);
router.post('/auth/facebook', facebookAuth);

module.exports = router;

