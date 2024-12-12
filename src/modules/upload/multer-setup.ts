import multer from "multer";
import fs from "fs-extra";
import getPathName from "../../lib/utils/get-path-name";

// Multer configuration: Store the file in the cache directory
const storage = multer.diskStorage({
  destination: async (req, file, cb) => {
    const cacheDir = await getPathName("", "public/cache"); // Directory for temporary cache

    fs.ensureDirSync(cacheDir); // Ensure cache directory exist

    cb(null, cacheDir);
  },
  filename: (req, file, cb) => {
    const uniqueName = `${Math.round(Date.now() / 1000)}-${Math.floor(Math.random() * 10000)}-${file.originalname}`;
    cb(null, uniqueName);
  },
});

export const upload = multer({ storage });
