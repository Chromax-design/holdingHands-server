const express = require("express");
const dotenv = require("dotenv");
const cors = require("cors");
const menteeRouter = require("./routes/menteeRoutes");
const connectDB = require("./model/conn");
const mentorRouter = require("./routes/mentorRoutes");
const chatRouter = require("./routes/chatRoutes");
const messageRouter = require("./routes/messageRoutes");
const { app, server } = require("./socket/socket");
const { stripeRouter } = require("./routes/stripeRoutes");
const payPalRouter = require("./routes/payPalRoutes");
const OriginUrl = require("./socket/origins");

dotenv.config();
const corsOptions = {  
  origin: OriginUrl,
  methods: "GET,HEAD,PUT,PATCH,POST,DELETE",
  credentials: true,
};
app.use(cors(corsOptions));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// mentee routes
app.use("/mentee", menteeRouter);
app.use("/mentor", mentorRouter);
app.use("/", chatRouter, messageRouter);
app.use("/stripe", stripeRouter);
app.use("/payPal", payPalRouter);
app.use(express.static("ChatDocs"));
app.use(express.static("ChatImgs"));

connectDB();

const port = process.env.PORT || 3000;
server.listen(port, () => {
  console.log(`Server running on port: ${port}`);
});
