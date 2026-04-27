import {
  Controller,
  Post,
  UseInterceptors,
  UploadedFile,
  UseGuards,
  BadRequestException,
} from "@nestjs/common";
import { FileInterceptor } from "@nestjs/platform-express";
import { diskStorage } from "multer";
import { extname, join } from "path";
import { existsSync, mkdirSync } from "fs";
import { JwtAuthGuard } from "../auth/jwt-auth.guard";
import { v4 as uuidv4 } from "uuid";

const UPLOADS_DIR = join(process.cwd(), "uploads");
if (!existsSync(UPLOADS_DIR)) {
  mkdirSync(UPLOADS_DIR, { recursive: true });
}

@Controller("upload")
export class UploadController {
  @Post("image")
  @UseGuards(JwtAuthGuard)
  @UseInterceptors(
    FileInterceptor("file", {
      storage: diskStorage({
        destination: UPLOADS_DIR,
        filename: (req, file, cb) => {
          const uniqueSuffix = uuidv4();
          cb(null, `${uniqueSuffix}${extname(file.originalname)}`);
        },
      }),
      fileFilter: (req, file, cb) => {
        if (!file.mimetype.match(/\/(jpg|jpeg|png|gif|webp)$/)) {
          return cb(
            new BadRequestException("Only image files are allowed (jpg, png, gif, webp)"),
            false
          );
        }
        cb(null, true);
      },
      limits: {
        fileSize: 10 * 1024 * 1024,
      },
    })
  )
  uploadFile(@UploadedFile() file: any) {
    if (!file) {
      throw new BadRequestException("File is required");
    }
    const baseUrl = (process.env.APP_URL || "http://localhost:5000").replace(/\/+$/, "");
    return {
      url: `${baseUrl}/uploads/${file.filename}`,
    };
  }
}
