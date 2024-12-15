const express = require("express");
const path = require("node:path");
const router = require("./routes/router");

const app = express();
const PORT = 3000;

app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, "public")));
app.set("views", path.join(__dirname, "views"));
app.set("view engine", "ejs");

app.use("/", router);

app.listen(PORT, () =>
  console.log(`Listening on port: ${PORT}: http://localhost:${PORT}`)
);
