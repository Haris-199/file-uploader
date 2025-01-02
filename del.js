// grep -nr --exclude-dir=node_modules "console.error"

require("dotenv").config();
const prisma = require("./db/client");
const { createClient } = require("@supabase/supabase-js");
const fs = require("fs/promises");
const path = require("path");
const { buffer } = require("stream/consumers");
const { removeFile } = require("./utils");

(async () => {
  const value = "ds";
  const file = await prisma.file.findUnique({
    where: { id: value },
  });
  console.log(file);
  
})();
