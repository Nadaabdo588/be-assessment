const express = require("express");
const verifyToken = require("./middleware/verify_token");
const { getReports, getReportsByTag } = require("../../repositories/report_repository");

const router = express.Router()

router.get("/:user_id/", verifyToken, getReports);
router.get("/:user_id/:tag", verifyToken, getReportsByTag);

module.exports = router;