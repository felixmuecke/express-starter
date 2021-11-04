const express = require('express');

const validate = require('../../validation/validate');
const userValidation = require('../../validation/user.validation');
const { userController } = require('../../controllers');
const authenticate = require('../../middleware/authenticate');

const router = express.Router();

router.route('/').post(validate(userValidation.createUser), userController.createUser).get(userController.getAllUsers);

router.route('/:id').get(validate(userValidation.getUser), authenticate('admi'), userController.getUser);

module.exports = router;
