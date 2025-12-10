const express = require("express");
const router = express.Router();
const { sendMessage, getHistory } = require("../controllers/chatController");

router.post("/send", sendMessage);
router.get("/history", getHistory);

module.exports = router;
