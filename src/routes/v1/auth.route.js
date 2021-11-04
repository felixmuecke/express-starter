const express = require('express');

const validate = require('../../validation/validate');
const { authValidations, userValidations } = require('../../validation');
const { authController } = require('../../controllers');

const router = express.Router();

router.route('/login').post(validate(authValidations.login), authController.login);
router.route('/register').post(validate(userValidations.createUser), authController.register);

module.exports = router;
