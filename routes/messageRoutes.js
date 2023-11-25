const express = require("express");
const router = express.Router();
const {
  getMessages,
  sendMessage,
} = require("../controllers/messageControllers");

router.get("/get_messages/:chatId", getMessages);
router.post("/send_message", sendMessage);

module.exports = router;
