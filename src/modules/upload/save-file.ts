import fs from "fs-extra";
import path from "path";
import getPathName from "../../lib/utils/get-path-name";

export const saveFile = async (filename: string | string[], savePath: string) => {
  if (Array.isArray(filename)) {
    const operations = filename.map(async (file) => {
      const cacheDir = await getPathName("", "public/cache");
      const filePath = path.join(cacheDir, file);

      if (await fs.pathExists(filePath)) {
        const saveDir = await getPathName("", "public/images" + savePath);

        fs.ensureDirSync(cacheDir); // Ensure cache directory exist
        fs.ensureDirSync(saveDir); // Ensure save directory exist

        const oldPath = path.join(cacheDir, file);
        const newPath = path.join(saveDir, file);
        try {
          // Move file from cache to storage
          await fs.move(oldPath, newPath);

          const fullPath =
            process.env.NODE_ENV === "development"
              ? `http://localhost:${process.env.PORT}/images${savePath}/${file}`
              : `https://e-commerce.thelanerealestate.com/images${savePath}/${file}`;

          return fullPath;
        } catch (error) {
          throw new Error("[SAVE_FILE]: Error moving cached file to storage.");
        }
      } else {
        throw new Error("[SAVE_FILE]: File not found in cache, it could be the file hasn't been uploaded, or has already been moved.");
      }
    });

    const imagesPaths = await Promise.all(operations);

    return imagesPaths;
  } else {
    const cacheDir = await getPathName("", "public/cache");
    const filePath = path.join(cacheDir, filename);

    if (await fs.pathExists(filePath)) {
      const saveDir = await getPathName("", "public/images" + savePath);

      fs.ensureDirSync(cacheDir); // Ensure cache directory exist
      fs.ensureDirSync(saveDir); // Ensure save directory exist

      const oldPath = path.join(cacheDir, filename);
      const newPath = path.join(saveDir, filename);
      try {
        // Move file from cache to storage
        await fs.move(oldPath, newPath);

        const fullPath =
          process.env.NODE_ENV === "development"
            ? `http://localhost:${process.env.PORT}/images${savePath}/${filename}`
            : `https://e-commerce.thelanerealestate.com/images${savePath}/${filename}`;

        return fullPath;
      } catch (error) {
        throw new Error("[SAVE_FILE]: Error moving cached file to storage.");
      }
    } else {
      throw new Error("[SAVE_FILE]: File not found in cache, it could be the file hasn't been uploaded, or has already been moved.");
    }
  }
};
