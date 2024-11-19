import { v2 as cloudinary } from "cloudinary";
import ENV from "./conf";
import multer from "multer";
import { ValidationErr } from "./handlers";
import { FILE_FOLDER_CHOICES, FILE_SIZE_CHOICES, FILE_TYPE_CHOICES } from "../models/choices";
import { NextFunction, Request, Response } from "express";

// Configure cloudinary
cloudinary.config({
    cloud_name: ENV.CLOUDINARY_CLOUD_NAME,
    api_key: ENV.CLOUDINARY_API_KEY,
    api_secret: ENV.CLOUDINARY_API_SECRET,
});

// Dynamic upload function with dynamic file size and file types
const upload = (fields: { name: string; maxCount: number }[], fileSizeLimits: Record<string, number>, allowedMimeTypes: Record<string, string[]>) => {
    const multerInstance = multer({
        storage: multer.memoryStorage(),
        fileFilter: (req, file, cb) => {
            // Validate file type
            const allowedTypes = allowedMimeTypes[file.fieldname] || FILE_TYPE_CHOICES.IMAGE; // Default to common images

            if (!allowedTypes.includes(file.mimetype)) {
                return cb(new ValidationErr(file.fieldname, `Invalid file type. Allowed types: ${allowedTypes.join(", ")}`));
            }

            cb(null, true); // Accept the file for now
        }
    });

    // Combine the multer middleware with size validation
    const middleware = multerInstance.fields(fields);

    return (req: Request, res: Response, next: NextFunction) => {
        middleware(req, res, (err) => {
            if (err) {
                return next(err);
            }

            // Validate file size dynamically
            const files = req.files as { [fieldname: string]: Express.Multer.File[] };

            for (const [fieldname, fileList] of Object.entries(files)) {
                const maxSize = fileSizeLimits[fieldname] || FILE_SIZE_CHOICES.PROFILE; // Default to 2MB

                for (const file of fileList) {
                    if (file.buffer.length > maxSize) {
                        return next(new ValidationErr(fieldname, `File size exceeds ${maxSize / 1024 / 1024} MB.`));
                    }
                }
            }

            next();
        });
    };
};

async function uploadFileToCloudinary(fileBuffer: Buffer, folder: FILE_FOLDER_CHOICES): Promise<string | null> {
    if (!fileBuffer) return null
    return new Promise((resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream(
        {
          folder, // Optional: specify Cloudinary folder
        },
        (error, result) => {
          if (error) return reject(error);
          if (result) return resolve(result.secure_url);
        }
      );
      uploadStream.end(fileBuffer); // Pass buffer to Cloudinary
    });
  }

export { upload, uploadFileToCloudinary }