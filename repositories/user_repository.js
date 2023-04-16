const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const dotenv = require('dotenv');
const User = require("../models/User");
const sendMail = require("../services/nodemailer_service");
const key = process.env.JWT_SECRET;

function createUser(user) {
    return User.create(user);
}
//Check if there exists a user with the a specific username or email
function checkExistingUsernameOrEmail(username, email) {
    return User.findOne({ $or: [{ username }, { email }] });
}

function checkExistingEmail(email) {
    return User.findOne({ email });
}

async function register(req, res) {
    try {
        // Get user input
        console.log(req.body);
        const { username, first_name, last_name, email, password } = req.body;

        // Validate user input
        if (!(username && email && password && first_name && last_name)) {
            return res.status(400).json({ msgSrc: "missing input", msg: "All input is required" });
        } else {

            //validate the email
            if (!validateEmail(email)) {
                return res.status(400).json({ msgSrc: "email", msg: "Please enter a valid email" });
            }

            // check if user already exists
            // Validate if user exist in our database
            const existingUser = await checkExistingUsernameOrEmail(username, email);
            if (existingUser) {
                return res.status(400).json({ msgSrc: "taken", msg: "User already exists. Please Login" });
            }

            //Encrypt user password
            encryptedPassword = await bcrypt.hash(password, 10);

            //Generate random verfication code
            verficationCode = generateVerficationCode();
            encryptedVerficationCode = await bcrypt.hash(verficationCode, 15);

            // Create user instance
            const user = await createUser({
                first_name,
                last_name,
                email: email.toLowerCase(),
                username: username.toLowerCase(),
                password: encryptedPassword,
                verfication_code: encryptedVerficationCode

            });
            //Send verfication mail to the user
            const mailText = `Thank you for your registeration. Please verify your email using the following verfication code: ` + verficationCode;

            sendMail(mailText, user);
            // Generate token for the user
            const token = await jwt.sign(
                { user_id: user._id, email },
                key
            );
            // return new user
            console.log({ token: token, user: user })
            res.status(200).json({ token: token, user: user });
        }
    } catch (err) {
        console.log(err);
    }
}
async function login(req, res) {
    try {
        // Get user input
        const { email, password } = req.body;

        // Validate user input
        if (!(email)) {
            res.status(400).json({ msgSrc: "email", msg: "Username is required" });
        } else if (!password) {
            res.status(400).json({ msgSrc: "password", msg: "Password is required" });
        }
        else {
            // Validate if user exists in db
            const user = await checkExistingEmail(email.toLowerCase());
            console.log(user.password);
            if (!user) {
                res.status(400).json({ msgSrc: "email-credentials", msg: "Email does not exist" });

            } else if (!(await bcrypt.compare(password, user.password))) {
                res.status(400).json({ msgSrc: "password-credentials", msg: "Incorrect password" });
            }
            else {
                // Create token
                const token = jwt.sign(
                    { user_id: user._id, email },
                    key
                );
                // user
                console.log({ "token": token, "user": user });
                res.status(200).json({ "token": token, "user": user });
            }
        }
    } catch (err) {

        console.log(err);
    }
    // Our register logic ends here
}
async function verfiy(req, res) {
    try {
        // Get user input
        const { email, verification_code } = req.body;

        // Validate user input
        if (!(email)) {
            res.status(400).json({ msgSrc: "Email", msg: "Email is required" });
        } else if (!verification_code) {
            res.status(400).json({ msgSrc: "verfication code", msg: "Verfication code is required" });
        }
        else {
            // Get
            const user = await checkExistingEmail(email.toLowerCase());
            if (!user) {
                res.status(400).json({ msgSrc: "email-credentials", msg: "Email does not exist" });

            } else if (!(await bcrypt.compare(verification_code, user.verfication_code))) {
                res.status(400).json({ msgSrc: "verification", msg: "Invalid verification code" });
            }
            else {
                // Change verification status
                user.verified = true;
                user.save();
                const token = await jwt.sign(
                    { user_id: user._id, email },
                    key
                );
                // return new user
                console.log({ token: token, user: user })
                res.status(200).json({ msg: "User verified", token: token, user: user });
            }
        }
    } catch (err) {

        console.log(err);
    }
    // Our register logic ends here
}


function validateEmail(email) {
    return String(email)
        .toLowerCase()
        .match(
            /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/
        );
}
function generateVerficationCode() {
    const characters = '0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ';
    let token = '';
    for (let i = 0; i < 25; i++) {
        token += characters[Math.floor(Math.random() * characters.length)];
    }
    return token;
}

module.exports = { verfiy, register, login };