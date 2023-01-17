'use strict'

var express = require('express')
var userController = require('./../controllers/userController')

var router = express.Router();
var md_auth = require('./../middlewares/authenticated')

var multipart = require('connect-multiparty')
// Middleware para habilitar la subida de archivos
var md_upload = multipart({uploadDir: './uploads/users'})


router.get('/probando', userController.probando);
router.post('/testeando', userController.testeando);

// Rutas de usuarios
router.post('/register', userController.save);
router.post('/login', userController.login);
router.put('/update', md_auth.authenticated, userController.update);
router.put('/update-avatar', [md_auth.authenticated, md_upload], userController.uploadAvatar);
router.get('/avatar/:fileName', userController.avatar)
router.get('/users', userController.getUsers)
router.get('/user/:userId', userController.getUser)

module.exports = router