import multer from "multer";

const MAX_FILE_SIZE_BYTES = 10 * 1024 * 1024;

export const uploadAttachmentMiddleware = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: MAX_FILE_SIZE_BYTES },
  fileFilter: (_req, file, cb) => {
    if (!file.originalname.trim()) {
      cb(new Error("Invalid file name"));
      return;
    }

    cb(null, true);
  },
}).single("file");
