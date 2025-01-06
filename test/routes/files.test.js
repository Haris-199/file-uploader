const request = require("supertest");
const express = require("express");
const filesRouter = require("../../routes/files");
const prisma = require("../../db/client");

describe("Files Routes", () => {
  let app;
  let newFile;

  beforeEach(() => {
    app = express();
    app.use(async (req, res, next) => {
      req.user = await prisma.user.findUnique({ where: { id: 1 } });
      res.locals.user = req.user;
      next();
    });
    app.set("view engine", "ejs");
    app.use(express.json());
    app.use(express.urlencoded({ extended: false }));
    app.use("/files", filesRouter);
  });
  
  
  describe("GET /files/:fileId", () => {
    it("should return file", async () => {
      const response = await request(app).get("/files/def0d402-be15-40ec-aaea-8067c663218f");
      expect(response.status).toBe(200);
      expect(response.type).toBe("text/html");
      expect(response.text).toContain("File Details");
    });

    it("should redirect to /signin if user is not signed in", async () => {
      app = express();
      app.set("view engine", "ejs");
      app.use(express.json());
      app.use("/files", filesRouter);
      const response = await request(app).get("/files/def0d402-be15-40ec-aaea-8067c663218f");
      expect(response.status).toBe(302);
      expect(response.headers.location).toBe("/signin");
    });

    it("should return a 404 error for bad file ids", async () => {
      const response = await request(app).get("/files/0");
      expect(response.status).toBe(404);
      expect(response.type).toBe("text/html");
    });

    it("should return a 403 error for accessing other users files", async () => {
      const response = await request(app).get("/files/68ff2c8a-7a57-4725-948d-7a5c20821df0");
      expect(response.status).toBe(403);
      expect(response.type).toBe("text/html");
    });
  });

  describe("POST /files", () => {
    it("should upload a file", async () => {
      const response = await request(app)
        .post("/files")
        .attach("uploaded_file", __dirname + "/test.txt");
      expect(response.status).toBe(302);
      newFile = (await prisma.file.findMany({ orderBy: { uploadedAt: "desc" }, include: {user: true} }))[0];
    });

    it("should handle missing file", (done) => {
      request(app)
        .post("/files")
        .expect(400, done);
    });
  });

  describe("PUT /files/:fileId", () => {
    it("should update a file name", async () => {      
      const response = await request(app)
        .put(`/files/${newFile.id}`)
        .send({ newName: "New Name", fileId: newFile.id });
      expect(response.status).toBe(200);
    });

    it("should return a 400 error for bad file ids", async () => {
      const response = await request(app).put("/files/0");
      expect(response.status).toBe(400);
    });

    it("should return a 403 error for accessing other users files", async () => {
      const response = await request(app)
        .put("/files/68ff2c8a-7a57-4725-948d-7a5c20821df0")
        .send({ newName: "New Name", fileId: "68ff2c8a-7a57-4725-948d-7a5c20821df0" });
      expect(response.text).toContain("You don’t have permission to access this resource.");
      expect(response.status).toBe(400);
    });
  });

  describe("GET /files/:fileId/download", () => {
    it("should download a file", async () => {
      const response = await request(app).get(`/files/${newFile.id}/download`);
      expect(response.status).toBe(200);
    });

    it("should return a 404 error for bad file ids", async () => {
      const response = await request(app).get("/files/0/download");
      expect(response.status).toBe(404);
    });

    it("should return a 403 error for accessing other users files", async () => {
      const response = await request(app).get("/files/68ff2c8a-7a57-4725-948d-7a5c20821df0/download");
      expect(response.text).toContain("You don’t have permission to access this resource.");
      expect(response.status).toBe(403);
    });
  });

  describe("DELETE /files/:fileId", () => {
    it("should delete a file", async () => {
      const response = await request(app).delete(`/files/${newFile.id}`);
      expect(response.status).toBe(200);
    });

    it("should return a 400 error for bad file ids", async () => {
      const response = await request(app).delete("/files/0");
      expect(response.text).toContain("Invalid file ID.");
      expect(response.status).toBe(400);
    });

    it("should return a 403 error for accessing other users files", async () => {
      const response = await request(app).delete("/files/68ff2c8a-7a57-4725-948d-7a5c20821df0")
      expect(response.text).toContain("You don’t have permission to access this resource.");
      expect(response.status).toBe(400);
    });
  });
});