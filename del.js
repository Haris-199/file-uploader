// grep -nr --exclude-dir=node_modules "console.error"

require("dotenv").config();
const prisma = require("./db/client");
const { createClient } = require("@supabase/supabase-js");
const fs = require("fs/promises");
const path = require("path");
const { buffer } = require("stream/consumers");
const { removeFile } = require("./utils");

// Create a single supabase client for interacting with your database
const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_ANON_KEY,
);

(async () => {
  try {
    // console.log(await prisma.file.findMany());
    const file = await prisma.file.findUnique({
      where: { id: "09a7ebb0-3ae2-4fb6-b7e8-f6b46b00600c" },
      // where: { id: "05ad45fd-bf6c-4767-9301-3b4e29b3a361" },
    });

    console.log(file);
    const filePath = path.relative(process.cwd(), "./public/uploads/" + file.id);
    
    const buffer = await fs.readFile(filePath);
    const f = new File(buffer, file.id, { type: file.mimetype });
    console.log(f);
    
    
    
    // const { data, error } = await supabase.storage
    //   .from('Files')
    //   .upload(filePath, buffer);

    const { data, error } = await supabase.storage
      .from('Files')
      .upload(filePath, buffer, { contentType: file.mimetype });
      
    if (error) {
      console.error('Error uploading file:', error);
    } else {
      console.log('File uploaded successfully:', data);
    }
  } catch (e) {
    console.error(e);
  }
});

(async () => {
  const str = "p28.png";
  const filePath = path.relative(process.cwd(), "./public/uploads/" + str);
  removeFile(str);
})();
