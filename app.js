const express = require("express");
const path = require("node:path");
const router = require("./routes");
const passport = require("passport");
const session = require("express-session");
const { PrismaSessionStore } = require("@quixo3/prisma-session-store");
const { PrismaClient } = require("@prisma/client");
require("dotenv").config();

const app = express();
const PORT = process.env.SECRET | 3000;

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
app.use(express.static(path.join(__dirname, "public")));
app.set("views", path.join(__dirname, "views"));
app.set("view engine", "ejs");

app.use((req, res, next) => {
  if (req.user) {
    res.locals.user = req.user;
  }
  next();
});
app.use("/", router);

app.listen(PORT, () =>
  console.log(`Listening on port ${PORT}: http://localhost:${PORT}`)
);
