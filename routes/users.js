const admin = require('../middleware/admin')
const auth = require('../middleware/auth')
const jwt = require('jsonwebtoken')
const config = require('config')
const bcrypt = require('bcrypt')
const _ = require("lodash"); 
const { User, Validate } = require('../models/users')
const mongoose = require('mongoose');
const express = require('express');
const router = express.Router();

router.get('/me', auth, async(req, res) => {
    const User_info = await User.findById(req.user._id).select('-password');
    res.send(User_info)
})

// Register/POST single user
router.post("/", async (req, res) => {
    const { error } = Validate(req.body);
    if (error) return res.status(400).send(error.details[0].message);

    let user = await User.findOne({ email: req.body.email })
    if (user) return res.status(400).send("User is already Registered!")

    user = new User(_.pick(req.body, ['name','email', 'password']))
    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(user.password, salt)
    await user.save();
    // Return the added movie to user
    const token = user.generateAuthToken();
    res.header('x-auth-token', token).send(_.pick(user, [ '_id', 'name', 'email']));
})

module.exports = router