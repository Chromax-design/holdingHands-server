const { insertData, selectData } = require("../utils/sqlHandlers");

const getMessages = async (req, res) => {
  const chatId = req.params.chatId;
  try {
    const messages = await selectData("messages", "roomId", chatId);
    return res.json(messages);
  } catch (error) {
    res.json({ error: error.message });
  }
};

const sendMessage = async (req, res) => {
  const message = {
    messageId: Date.now(),
    author: req.body.author,
    roomId: req.body.roomId,
    message: req.body.message,
    sender: req.body.sender,
    receiver: req.body.receiver,
    imgFileName: req.body.imgFileName,
    docOriginalName: req.body.docOriginalName,
    docfileName: req.body.docfileName,
  };

  try {
    await insertData("messages", message);
    // console.log(data);
    return res.json(message);
  } catch (error) {
    res.json({ error: error.message });
  }
};

module.exports = {
  getMessages,
  sendMessage,
};
