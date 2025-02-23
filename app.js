const express = require("express");
const path = require("node:path");
const router = require("./routes");
const { serverErrorHandler } = require("./controllers/errors/server");
const passport = require("passport");
const session = require("express-session");
const { PrismaSessionStore } = require("@quixo3/prisma-session-store");
const { PrismaClient } = require("@prisma/client");
const userConfig = require("./config/user-setup");
require("./config/passport-setup");
require("dotenv").config();

const app = express();
const PORT = process.env.PORT || 3000;

app.use(
  session({
    cookie: { maxAge: 2 * 24 * 60 * 60 * 1000 },
    secret: process.env.SECRET,
    resave: true,
    saveUninitialized: true,
    store: new PrismaSessionStore(new PrismaClient(), {
      checkPeriod: 2 * 60 * 1000,
      dbRecordIdIsSessionId: true,
      dbRecordIdFunction: undefined,
    }),
  })
);
app.use(passport.session());
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

app.use('/css', express.static(__dirname + "/node_modules/bootstrap/dist/css"));
app.use('/js', express.static(__dirname + "/node_modules/bootstrap/dist/js"));
app.use('/icons', express.static(__dirname + "/node_modules/bootstrap-icons/font"));
app.use(express.static(path.join(__dirname, "public")));
app.set("views", path.join(__dirname, "views"));
app.set("view engine", "ejs");

app.use(userConfig);
app.use("/", router);
app.use(serverErrorHandler);

app.listen(PORT, () =>
  console.log(`Listening on port ${PORT}: http://localhost:${PORT}`)
);
