import { v2 as cloudinary } from "cloudinary";
import ENV from "./conf";
import multer from "multer";
import { ErrorCode, RequestError, ValidationErr } from "./handlers";

// Configure cloudinary
cloudinary.config({
    cloud_name: ENV.CLOUDINARY_CLOUD_NAME,
    api_key: ENV.CLOUDINARY_API_KEY,
    api_secret: ENV.CLOUDINARY_API_SECRET,
});

// Set up multer with memory storage
// Configure multer to use memory storage with a file size limit
const upload = multer({
    storage: multer.memoryStorage(),
    limits: { fileSize: 2 * 1024 * 1024 }, // 2 MB limit
    fileFilter: (req, file, cb) => {
      // Optionally, you can filter the file type here
      if (file.mimetype.startsWith("image/")) {
        cb(null, true); // Accept image files
      } else {
        cb(new ValidationErr(file.fieldname, "Only image files are allowed")) // Reject non-image files
      }
    }
});

async function uploadImageToCloudinary(fileBuffer: Buffer, folder: string): Promise<string> {
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

export { upload, uploadImageToCloudinary }