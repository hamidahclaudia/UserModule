const error = require('restify-errors');
const bcrypt = require('bcryptjs');
const User = require('../models/Users');
const auth = require('../auth');
const check = require('../check');
const jwt = require('jsonwebtoken');
const config = require('../config');
var validator = require('validator');

module.exports = server => {

    //Register User
    server.post('/user/register', async (req, res, next) => {
        try {
            const { email, password, phone } = req.body;
            if(email == null) {
                return next(new error.InvalidContentError("Email must be filled"));
            }
            if(password == null) {
                return next(new error.InvalidContentError("Password must be filled"));
            }
            if(phone == null) {
                return next(new error.InvalidContentError("Phone must be filled"));
            }
            
            const isEmail = validator.isEmail(email);
            const isAlphaNum = validator.isAlphanumeric(password);
            const isMinLength = validator.isLength(password, { min: 8 });

            if (isEmail == true && isAlphaNum == true && isMinLength == true) {
                const checkUserAvalaible = await check.checkingUser(email, phone)
                const user = new User({
                    email,
                    password,
                    phone
                });
                bcrypt.genSalt(10, (err, salt) => {
                    bcrypt.hash(user.password, salt, async (err, hash) => {
                        user.password = hash;
                        const newUser = await user.save();
                        res.send(201);
                    });
                });
                next();
            }
            else{
                return next(new error.InvalidContentError("Password or email is not valid"));
            }
        } catch (err) {
            return next(new error.InternalError(err));
        }
    });

    //Login(Authenticate User)
    server.post('/user/auth', async (req, res, next) => {
        const { email, password } = req.body;

        try {
            //Authenticate user
            const user = await auth.authenticate(email, password);
            
            //Create JWT
            const token = jwt.sign(user.toJSON(), config.JWT_SECRET, {
                expiresIn: '30m'
            });

            const { iat, exp } = jwt.decode(token);
            const userId = user._id.toString();

            //Respond with token
            res.send({ iat, exp, token, userId});
        } catch (err) {
            //Unauthorized
            return next(new error.UnauthorizedError(err));
        }
    });

    //Get single user 
    server.get('/user/profile/:id', async (req, res, next) => {
        const user = await User.findOne({ _id: req.params.id })
        try {
            res.send({
                username: user.username == null ? "-" : user.username,
                email: user.email,
                phone: user.phone == null ? "-" : user.phone,
                address: user.address == null ? "-" : user.address
            });
            next();
        } catch (err) {
            return next(new err.ResourceNotFoundError(`There is no customer with id ${req.params.id}`));
        }
    });

    //Get All User
    server.get('/user/profile', async (req, res, next) => {
        const users = await User.find({});
        try {
            res.send({users});
            next();
        } catch (err) {
            return next(new err.ResourceNotFoundError(err));
        }
    });

    //Update user profile
    server.put('/user/profile/:id', async (req, res, next) => {
        if (!req.is('application/json')) {
            return next(
                new errors.InvalidContentError("Expects 'application/json'")
            );
        }
        try {
            if (req.body.phone != null || req.body.email != null) {
                return next(new error.InvalidContentError("Email or phone cannot be changed"));
            }
            else {
                const user = await User.findOneAndUpdate({ _id: req.params.id }, req.body);
                res.send(200);
                next();
            }
        } catch (err) {
            return next(new error.ResourceNotFoundError(`There is no customer with id ${req.params.id}`));
        }
    });

    //Change password
    server.put('/user/changepassword/:id', async (req, res, next) => {
        if (!req.is('application/json')) {
            return next(
                new errors.InvalidContentError("Expects 'application/json'")
            );
        }
        try {
            const isAlphaNum = validator.isAlphanumeric(req.body.password);
            const isLength = validator.isLength(req.body.password, { min: 8 });
            if(isAlphaNum == true && isLength == true){
                bcrypt.genSalt(10, (err, salt) => {
                    bcrypt.hash(req.body.password, salt, async (err, hash) => {
                        const user = await User.findOneAndUpdate({ _id: req.params.id }, { $set: { "password": hash } });
                        res.send(200);
                    });
                });
                next();
            }
            else{
                return next(new error.InvalidContentError(`Password is not valid`));
            }           
        } catch (err) {
            return next(new error.InvalidContentError(`Password is not valid`));
        }
    })
};