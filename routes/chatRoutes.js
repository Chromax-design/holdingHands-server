const express = require("express");
const router = express.Router();
const {
  createChat,
  uploadImg,
  uploadPdf,
  getPdf,
  getImg,
} = require("../controllers/chatControllers");
const multer = require("multer");
const path = require("path");

const storage1 = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "ChatImgs/");
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + path.extname(file.originalname));
  },
});

const storage2 = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "ChatDocs/");
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + path.extname(file.originalname));
  },
});

const upload1 = multer({ storage: storage1 });
const upload2 = multer({ storage: storage2 });

router.post("/create_chat", createChat);
router.post("/chat/uploadImg", upload1.single("image"), uploadImg);
router.post("/chat/upload-pdf", upload2.single("pdf"), uploadPdf);
router.get("/chat/pdf/:filename", getPdf);
router.get("/chat/image/:filename", getImg);

module.exports = router;
