const fs = require("fs").promises;
const path = require("path");
const { removeFile } = require("../../utils/index");

jest.mock("fs", () => ({
  promises: {
    unlink: jest.fn(),
  },
}));

console.error = jest.fn((err) => console.log(err));

describe("removeFile", () => {
  const fileId = "test-file-id";
  const filePath = path.relative(process.cwd(), `./public/uploads/${fileId}`);

  afterEach(() => {
    jest.clearAllMocks();
  });

  it("should remove the file successfully", async () => {
    fs.unlink.mockResolvedValueOnce();

    await removeFile(fileId);

    expect(fs.unlink).toHaveBeenCalledWith(filePath);
    expect(fs.unlink).toHaveBeenCalledTimes(1);
    expect(console.error).toHaveBeenCalledTimes(0);

  });

  it("should handle file not found error", async () => {
    const error = new Error("File not found");
    fs.unlink.mockRejectedValueOnce(error);

    await removeFile(fileId);

    expect(fs.unlink).toHaveBeenCalledWith(filePath);
    expect(fs.unlink).toHaveBeenCalledTimes(1);
    expect(console.error).toHaveBeenCalledWith(`Error deleting file:\n${error}`);
  });
});
