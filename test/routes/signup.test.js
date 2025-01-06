const request = require("supertest");
const express = require("express");
const prisma = require("../../db/client");
const signupRouter = require("../../routes/signup");

describe("Signup routes", () => {
  let app;

  beforeEach(() => {
    app = express();
    app.set("view engine", "ejs");
    app.use(express.json());
    app.use(express.urlencoded({ extended: false }));
    app.use("/signup", signupRouter);
  });
 
  describe("GET /signup", () => {
    it("should return the signup page", async () => {
      const response = await request(app).get("/signup");
      expect(response.status).toBe(200);
      expect(response.type).toBe("text/html");
      expect(response.text).toContain("Sign Up");
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
      app.use("/signup", signupRouter);
      const response = await request(app).get("/signup");
      expect(response.status).toBe(302);
      expect(response.headers.location).toBe("/folders");
    });
  });

  describe("POST /signup", () => {
    afterAll(async () => {
      await prisma.user.delete({ where: { username: "TestUser" } });
    });

    it("should create user successfully", async () => {
      const username = "TestUser";
      const password = "yEvJq_1nb";
      const response = await request(app)
        .post("/signup")
        .send({ username, password, confirm_password: password });
      expect(response.status).toBe(302);
      expect(response.headers.location).toBe("/signin");

      await new Promise((r) => setTimeout(r, 250)); // wait for the user to be created
      const user = await prisma.user.findUnique({ where: { username } });
      expect(user.username).toBe(username);
    });

    it("should not create user with missing username", async () => {
      const response = await request(app)
        .post("/signup")
        .send({ password: "yEvJq_1nb", confirm_password: "yEvJq_1nb" });
      expect(response.status).toBe(400);
      expect(response.text).toContain("Please provide a valid username.");
    });

    it("should not create user with a username that already exists", async () => {
      const response = await request(app)
        .post("/signup")
        .send({ username: "testuser", password: "yEvJq_1nb", confirm_password: "yEvJq_1nb" });
      expect(response.status).toBe(400);
      expect(response.text).toContain("Username already exists.");
    });
    
    it("should not create user with missing password", async () => {
      const username = "TestUserFail";
      const response = await request(app)
        .post("/signup")
        .send({username, password: "", confirm_password: "password" });
      expect(response.status).toBe(400);
      expect(response.text).toContain("Please provide a password.");
    });
    
    it("should not create user with mismatching passwords", async () => {
      const username = "TestUserFail";
      const response = await request(app)
        .post("/signup")
        .send({ username, password: "yEvJq_1nb", confirm_password: "diff_yEvJq_1nb" });
        expect(response.status).toBe(400);
        expect(response.text).toContain("Passwords do not match.");
    });

    it("should not allow password less than 8 characters", async () => {
      const username = "TestUserFail";
      const response = await request(app)
        .post("/signup")
        .send({ username, password: "yEvJ_19", confirm_password: "yEvJ_19" });
      expect(response.status).toBe(400);
      expect(response.text).toContain("Password must be at least 8 characters long.");
    });

    it("should not allow password without at least one uppercase letter", async () => {
      const username = "TestUserFail";
      const response = await request(app)
        .post("/signup")
        .send({ username, password: "yevjq_1nb", confirm_password: "yevjq_1nb" });
      expect(response.status).toBe(400);
      expect(response.text).toContain("Password must contain an uppercase letter.");
    });

    it("should not allow password without at least one lowercase letter", async () => {
      const username = "TestUserFail";
      const response = await request(app)
        .post("/signup")
        .send({ username, password: "YEVJQ_1NB", confirm_password: "YEVJQ_1NB" });
      expect(response.status).toBe(400);
      expect(response.text).toContain("Password must contain a lowercase letter.");
    });

    it("should not allow password without a digit", async () => {
      const username = "TestUserFail";
      const response = await request(app)
        .post("/signup")
        .send({ username, password: "yEvJq_nb", confirm_password: "yEvJq_nb" });
      expect(response.status).toBe(400);
      expect(response.text).toContain("Password must contain a digit.");
    });

    it("should not allow password without a special character", async () => {
      const username = "TestUserFail";
      const response = await request(app)
        .post("/signup")
        .send({ username, password: "yEvJq1nb", confirm_password: "yEvJq1nb" });
      expect(response.status).toBe(400);
      expect(response.text).toContain("Password must contain a special character.");
    });
  });
});