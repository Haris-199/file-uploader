const request = require("supertest");
const express = require("express");
const homeRouter = require("../../routes/home");
const { serverErrorHandler } = require("../../controllers/errors/server");

describe("GET /", () => {
  let app;

  beforeEach(() => {
    app = express();
    app.set("view engine", "ejs");
    app.use("/", homeRouter);
  });

  it("should render the home view", async () => {
    const response = await request(app).get("/");
    expect(response.status).toBe(200);
    
    expect(response.text).toContain("Welcome to NeoDrive");
    expect(response.type).toBe("text/html");
  });

  it("should handle unexpected exceptions", async () => {
    app.get("/unexpected-error", (req, res) => {
      throw new Error("Unexpected error");
    });
    app.use(serverErrorHandler);

    const response = await request(app).get("/unexpected-error");
    expect(response.status).toBe(500);
    expect(response.type).toBe("text/html");
    expect(response.text).toContain("Something went wrong.");
  });
});
