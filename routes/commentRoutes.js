'use strict'

var express = require('express')
var commentController = require('./../controllers/commentController')
var router = express.Router();
var md_auth = require('../middlewares/authenticated')

router.post('/comment/topic/:topicId', md_auth.authenticated, commentController.add)
router.put('/comment/:commentId', md_auth.authenticated, commentController.update)
router.delete('/comment/:topicId/:commentId', md_auth.authenticated, commentController.delete)



module.exports = router