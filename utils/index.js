const fs = require("fs").promises;
const path = require("path");
const { cwd } = require("node:process");

/**
 * Asynchronously removes a file from uploads.
 *
 * @async
 * @function removeFile
 * @param {string} id The unique identifier (UUID) of the file to be removed.
 * @throws {Error} Throws an error if the file cannot be deleted (e.g., file not found or permission issues).
 * @returns {Promise<void>} Resolves when the file is successfully deleted.
 */
const removeFile = async (id) => {
  const filePath = path.relative(cwd(), "./public/uploads/" + id);
  try {
    await fs.unlink(filePath);
  } catch (err) {
    console.error(`Error deleting file:\n${err}`);
  }
};

module.exports = { removeFile };
