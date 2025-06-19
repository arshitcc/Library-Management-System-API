import fs from "fs";

export const removeLocalFile = (localPath) => {
  fs.unlink(localPath, (err) => {
    if (err) console.error("Error while removing local files: ", err);
    else {
      console.info("Removed local: ", localPath);
    }
  });
};

export const removeUnusedMulterImageFilesOnError = (req) => {
  try {
    const multerFile = req.file;
    const multerFiles = req.files;

    if (multerFile) {
      removeLocalFile(multerFile.path);
    }

    if (multerFiles) {
      const filesValueArray = Object.values(multerFiles);
      filesValueArray.map((fileFields) => {
        fileFields.map((fileObject) => {
          removeLocalFile(fileObject.path);
        });
      });
    }
  } catch (error) {
    console.error("Error while removing image files: ", error);
  }
};
