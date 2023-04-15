const express = require("express");
const verifyToken = require("./middleware/verify_token");
const { createCheck, getCheckByID, updateCheck, deleteCheck } = require("../../repositories/check_repository");

const router = express.Router()

router.post("/", verifyToken, createCheck)
router.get("/:user_id/:check_id", verifyToken, getCheckByID);
router.put("/:user_id/:check_id", verifyToken, updateCheck);
router.delete("/:user_id/:check_id", verifyToken, deleteCheck);

module.exports = router;