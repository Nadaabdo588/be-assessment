const express = require("express");
const { register, login, verfiy } = require("../../repositories/user_repository");

const router = express.Router()

router.post("/signup", register);
router.post("/login", login);
router.post("/verify", verfiy);

module.exports = router;