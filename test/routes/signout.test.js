const request = require("supertest");
const express = require("express");
const signoutRouter = require("../../routes/signout");

describe("Signout routes", () => {
  let app;

  beforeEach(() => {
    app = express();
    app.set("view engine", "ejs");
    app.use(express.json());
    app.use(express.urlencoded({ extended: false }));
    app.use("/signout", signoutRouter);
  });
 
  describe("GET /signout", () => {
    it("should redirect to /signin if user is not signed in", async () => {
      app = express();
      app.set("view engine", "ejs");
      app.use(express.json());
      app.use(express.urlencoded({ extended: false }));
      app.use((req, res, next) => {
        req.user = false;
        res.locals.user = req.user;
        next();
      });
      app.use("/signout", signoutRouter);
      const response = await request(app).get("/signout");
      expect(response.status).toBe(302);
      expect(response.headers.location).toBe("/signin");
    });
  });
});
