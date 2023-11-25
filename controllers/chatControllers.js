const { insertData, selectData } = require("../utils/sqlHandlers");
const cloudinary = require("cloudinary").v2;
const path = require("path");

// cloudinary.config({
//   cloud_name: "dm7rsnfaj",
//   api_key: 158634195245211,
//   api_secret: "X5XpIpJG-jBLi84rQWsNuzu0Hg8",
// });
const imgsFolder = path.resolve(__dirname, "..", "ChatImgs");
const docsFolder = path.resolve(__dirname, "..", "ChatDocs");

const getImg = (req, res) => {
  const filename = req.params.filename;
  const filePath = path.join(imgsFolder, filename);
  res.sendFile(filePath);
};

const getPdf = (req, res) => {
  const filename = req.params.filename;
  const filePath = path.join(docsFolder, filename);
  res.sendFile(filePath);
};

const uploadPdf = (req, res) => {
  const { file } = req;

  if (!file) {
    return res.status(400).json({ error: "No file provided" });
  }

  const fileData = {
    originalName: file.originalname,
    fileName: file.filename,
  };

  return res.json({ success: true, ...fileData });
};

const uploadImg = (req, res) => {
  const { file } = req;

  if (!file) {
    return res.status(400).json({ error: "No file provided" });
  }

  const fileData = {
    fileName: file.filename,
  };

  return res.json({ success: true, ...fileData });
};

const createChat = async (req, res) => {
  const { roomId, participantA, participantB } = req.body;
  const chat = {
    roomId,
    participantA,
    participantB,
  };

  try {
    const existingChat = await selectData("chats", "roomId", roomId);
    if (existingChat.length != 0) {
      return res.json(existingChat);
    } else {
      await insertData("chats", chat);
      return res.json(chat);
    }
  } catch (error) {
    res.json({ error: error.message });
  }
};

module.exports = {
  createChat,
  uploadImg,
  uploadPdf,
  getPdf,
  getImg,
};
