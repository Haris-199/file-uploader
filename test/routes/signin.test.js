const request = require("supertest");
const express = require("express");
const signinRouter = require("../../routes/signin");

const passport = require("passport");
const session = require("express-session");
const { PrismaSessionStore } = require("@quixo3/prisma-session-store");
const { PrismaClient } = require("@prisma/client");
require("../../config/passport-setup");
require("dotenv").config();

describe("Signin routes", () => {
  let app;

  beforeEach(() => {
    app = express();
    app.set("view engine", "ejs");
    app.use(express.json());
    app.use(express.urlencoded({ extended: false }));
    app.use("/signin", signinRouter);
  });
 
  describe("GET /signin", () => {
    it("should return the signin page", async () => {
      const response = await request(app).get("/signin");
      expect(response.status).toBe(200);
      expect(response.type).toBe("text/html");
      expect(response.text).toContain("Sign In");
    });
    
    it("should redirect to /folders if user is already signed in", async () => {
      app = express();
      app.set("view engine", "ejs");
      app.use(express.json());
      app.use(express.urlencoded({ extended: false }));
      app.use((req, res, next) => {
        req.user = true;
        res.locals.user = req.user;
        next();
      });
      app.use("/signin", signinRouter);
      const response = await request(app).get("/signin");
      expect(response.status).toBe(302);
      expect(response.headers.location).toBe("/folders");
    });
  });

  describe("POST /signin", () => {
    beforeEach(() => {
      app = express();
      app.use(
        session({
          cookie: { maxAge: 60 * 1000 },
          secret: process.env.SECRET,
          resave: true,
          saveUninitialized: true,
        })
      );
      app.use(passport.session());
      app.use(express.json());
      app.use(express.urlencoded({ extended: false }));
      app.set("view engine", "ejs");
      app.use("/signin", signinRouter);
    });

    it("should sign in user successfully", async () => {
      const username = "testuser";
      const password = "fyO_L2Vu";
      const response = await request(app)
        .post("/signin")
        .send({ username, password });
      expect(response.status).toBe(302);
      expect(response.headers.location).toBe("/folders");
    });

    it("should not sign in with invalid username", async () => {
      const response = await request(app)
        .post("/signin")
        .send({ username: "test", password: "fyO_L2Vu" });
      expect(response.status).toBe(400);
      expect(response.text).toContain("Incorrect username or user does not exist.");
    });

    it("should not sign in with wrong password", async () => {
      const response = await request(app)
        .post("/signin")
        .send({ username: "testuser", password: "fail" });
      expect(response.status).toBe(400);
      expect(response.text).toContain("Incorrect password.");
    });

    it("should not sign in with missing username", async () => {
      const response = await request(app)
        .post("/signin")
        .send({ password: "fyO_L2Vu" });
      expect(response.status).toBe(400);
      expect(response.text).toContain("Sign In");
    });

    it("should not sign in with missing password", async () => {
      const response = await request(app)
        .post("/signin")
        .send({ username: "testuser" });
      expect(response.status).toBe(400);
      expect(response.text).toContain("Sign In");
    });
  });
});
