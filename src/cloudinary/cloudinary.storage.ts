import { v2 as cloudinary } from 'cloudinary';
import { CloudinaryStorage } from 'multer-storage-cloudinary';
import multer from 'multer';

export const cloudinaryStorage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: () => ({
    folder: 'ceyblogger',
    allowed_formats: ['jpg', 'jpeg', 'png', 'gif', 'webp'],
  }),
});

export const cloudinaryUpload = multer({ storage: cloudinaryStorage });
