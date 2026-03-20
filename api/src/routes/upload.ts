import { Router, Request, Response, NextFunction } from "express";
import sharp from "sharp";
import { requireAuth } from "../middleware/auth";
import { upload } from "../middleware/upload";
import { uploadFile } from "../services/storage";
import { AppError } from "../middleware/errorHandler";
import { env } from "../config/env";
import { param } from "../utils/params";
import fs from "fs";
import path from "path";

async function optimizeImage(buffer: Buffer): Promise<Buffer> {
  return sharp(buffer)
    .resize(1200, 1200, { fit: "inside", withoutEnlargement: true })
    .webp({ quality: 80 })
    .toBuffer();
}

const router = Router();

const LOCAL_UPLOAD_DIR = path.join(__dirname, "../../uploads");

// POST /api/upload
router.post(
  "/",
  requireAuth,
  upload.single("image"),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      if (!req.file) {
        throw new AppError("No file uploaded", 400);
      }

      // Optimize: resize to max 1200px and convert to WebP
      const optimized = await optimizeImage(req.file.buffer);
      const optimizedName = req.file.originalname.replace(/\.[^.]+$/, ".webp");

      let url: string;

      if (env.isDev && !env.r2AccountId) {
        if (!fs.existsSync(LOCAL_UPLOAD_DIR)) {
          fs.mkdirSync(LOCAL_UPLOAD_DIR, { recursive: true });
        }
        const filename = `${Date.now()}-${optimizedName}`;
        const filepath = path.join(LOCAL_UPLOAD_DIR, filename);
        fs.writeFileSync(filepath, optimized);
        url = `${env.apiUrl}/api/upload/files/${filename}`;
      } else {
        url = await uploadFile(optimized, optimizedName, "image/webp");
      }

      res.json({ url });
    } catch (error) {
      next(error);
    }
  }
);

// GET /api/upload/files/:filename — Serve local uploads (dev only)
router.get("/files/:filename", (req: Request, res: Response, next: NextFunction) => {
  try {
    const filename = param(req, "filename");
    const filepath = path.join(LOCAL_UPLOAD_DIR, filename);
    if (!fs.existsSync(filepath)) {
      throw new AppError("File not found", 404);
    }
    res.sendFile(filepath);
  } catch (error) {
    next(error);
  }
});

export default router;
