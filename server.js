const express = require("express");
const dotenv = require("dotenv");
const cors = require("cors");
const menteeRouter = require("./routes/menteeRoutes");
const connectDB = require("./model/conn");
const mentorRouter = require("./routes/mentorRoutes");
const chatRouter = require("./routes/chatRoutes");
const messageRouter = require("./routes/messageRoutes");
const stripeRouter = require("./routes/stripeRoutes");
const { app, server } = require("./socket/socket");

dotenv.config();
const corsOptions = {
  origin: "https://holdinghands.onrender.com",
  methods: "GET,HEAD,PUT,PATCH,POST,DELETE",
  credentials: true, // Enable cookies and HTTP authentication with credentials
};
app.use(cors(corsOptions));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// mentee routes
app.use("/mentee", menteeRouter);
app.use("/mentor", mentorRouter);
app.use("/", chatRouter, messageRouter);
app.use("/stripe", stripeRouter);
app.use(express.static("ChatDocs"));

connectDB();

const port = process.env.PORT || 3000;
server.listen(port, () => {
  console.log(`Server running on port: ${port}`);
});
