const request = require("supertest");
const express = require("express");
const foldersRouter = require("../../routes/folders");
const prisma = require("../../db/client");


describe("Folders Routes", () => {
  let app;
  let newFolder;

  beforeEach(() => {
    app = express();
    app.use(async (req, res, next) => {
      req.user = await prisma.user.findUnique({ where: { id: 1 } });
      res.locals.user = req.user;
      next();
    });
    app.set("view engine", "ejs");
    app.use(express.json());
    app.use("/folders", foldersRouter);
  });

  describe("GET /folders/:folderId?", () => {
    it("should return folders and files", async () => {
      const response = await request(app).get("/folders");
      expect(response.status).toBe(200);
      expect(response.type).toBe("text/html");
    });

    it("should return a folder", async () => {
      const response = await request(app).get("/folders/1");
      expect(response.status).toBe(200);
      expect(response.type).toBe("text/html");
    });

    it("should redirect to /signin if user is not signed in", async () => {
      app = express();
      app.set("view engine", "ejs");
      app.use(express.json());
      app.use("/folders", foldersRouter);
      const response = await request(app).get("/folders");
      expect(response.status).toBe(302);
      expect(response.headers.location).toBe("/signin");
    });

    it("should return a 400 error for bad folder ids", async () => {
      const response = await request(app).get("/folders/0");
      expect(response.status).toBe(400);
      expect(response.type).toBe("text/html");
    });

    it("should return a 403 error for accessing other users folders", async () => {
      const response = await request(app).get("/folders/2");
      expect(response.status).toBe(403);
      expect(response.type).toBe("text/html");
    });
  });

  describe("POST /folders/:folderId?", () => {
    it("should create a new folder", async () => {
      const response = await request(app)
        .post("/folders")
        .send({ folder_name: "New Folder" });
      expect(response.status).toBe(302);
      expect(response.headers.location).toBe("/folders");
      newFolder = (await prisma.folder.findMany({ orderBy: { createdAt: "desc" } }))[0];
    });

    it("should return a 400 error for bad folder ids", async () => {
      const response = await request(app).post("/folders/0");
      expect(response.status).toBe(400);
      expect(response.type).toBe("text/html");
    });

    it("should return a 403 error for accessing other users folders", async () => {
      const response = await request(app).post("/folders/2");
      expect(response.status).toBe(403);
      expect(response.type).toBe("text/html");
    });

    it("should handle bad requests", async () => {
      const response = await request(app)
        .post("/folders/1")
        .send({ folder_name: "test", parentFolderId: 1 });
      expect(response.status).toBe(400);
      expect(response.type).toBe("text/html")
      expect(response.text).toContain("Param&#39;s folderId does not match body&#39;s parentFolderId.");
    });

    it("should handle bad requests", async () => {
      const response = await request(app)
        .post("/folders")
        .send({ folder_name: "" });
      expect(response.status).toBe(400);
      expect(response.type).toBe("text/html")
      expect(response.text).toContain("Name is required.");
    });
  });

  describe("PUT /folders/:folderId", () => {
    it("should update a folder name", async () => {
      const response = await request(app)
        .put(`/folders/${newFolder.id}`)
        .send({ folderId: newFolder.id, newName: "Updated Folder" });
      expect(response.status).toBe(200);
    });

    it("should return a 400 error for bad folder IDs", async () => {
      const response = await request(app).put("/folders/0");
      expect(response.status).toBe(400);
      expect(response.type).toBe("application/json");
    });

    it("should return a 400 error for folder that does not exist", async () => {
      const response = await request(app).put("/folders/1000000");
      expect(response.status).toBe(400);
      expect(response.type).toBe("application/json");
    });

    it("should return a 400 error for trying to access other users folders", async () => {
      const response = await request(app)
        .put("/folders/2")
        .send({ folder_name: "test", folderId: 2 });
      expect(response.status).toBe(400);
      expect(response.type).toBe("application/json");
    });

    it("should handle mismatching IDs in request", async () => {
      const response = await request(app)
        .put("/folders/3")
        .send({ folder_name: "test", folderId: 1 });
      expect(response.status).toBe(400);
      expect(response.type).toBe("application/json");
      expect(response.text).toContain("Param's folderId does not match body's folderId.");
    });

    it("should handle missing name in request", async () => {
      const response = await request(app)
        .put("/folders/1")
        .send({ folder_name: "" });
      expect(response.status).toBe(400);
      expect(response.type).toBe("application/json")
      expect(response.text).toContain("Name is required.");
    });
  });

  describe("DELETE /folders/:folderId", () => {
    it("should delete a folder", async () => {
      const response = await request(app).delete(`/folders/${newFolder.id}`);
      expect(response.status).toBe(200);
    });

    it("should return a 400 error for bad folder IDs", async () => {
      const response = await request(app).delete("/folders/invalidId");
      expect(response.status).toBe(400);
      expect(response.type).toBe("application/json");
      expect(response.text).toContain("Invalid folder ID.");
    });

    it("should return \"not found\" for bad folder that do not exist", async () => {
      const response = await request(app).delete("/folders/1000000");
      expect(response.status).toBe(400);
      expect(response.type).toBe("application/json");
      expect(response.text).toContain("Folder not found.");
    });

    it("should return a 400 error for accessing other users folders", async () => {
      const response = await request(app).delete("/folders/2");
      expect(response.status).toBe(400);
      expect(response.type).toBe("application/json");
      expect(response.text).toContain("You don’t have permission to access this resource.");
    });
  });
});
