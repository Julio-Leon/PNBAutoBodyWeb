const { getBucket } = require('../config/firebase');
const { v4: uuidv4 } = require('uuid');

class StorageService {
  constructor() {
    this.bucket = getBucket();
  }

  /**
   * Upload a single file to Firebase Storage
   */
  async uploadFile(file, folder = 'uploads') {
    try {
      const fileName = `${folder}/${uuidv4()}-${Date.now()}-${file.originalname}`;
      const fileUpload = this.bucket.file(fileName);

      const stream = fileUpload.createWriteStream({
        metadata: {
          contentType: file.mimetype,
        },
      });

      return new Promise((resolve, reject) => {
        stream.on('error', reject);
        stream.on('finish', async () => {
          try {
            // Make the file publicly accessible
            await fileUpload.makePublic();
            
            const publicUrl = `https://storage.googleapis.com/${this.bucket.name}/${fileName}`;
            
            resolve({
              fileName,
              publicUrl,
              size: file.size,
              mimetype: file.mimetype
            });
          } catch (error) {
            reject(error);
          }
        });
        stream.end(file.buffer);
      });
    } catch (error) {
      throw new Error(`File upload failed: ${error.message}`);
    }
  }

  /**
   * Upload multiple files
   */
  async uploadFiles(files, folder = 'uploads') {
    try {
      const uploadPromises = files.map(file => this.uploadFile(file, folder));
      return await Promise.all(uploadPromises);
    } catch (error) {
      throw new Error(`Multiple file upload failed: ${error.message}`);
    }
  }

  /**
   * Delete a file from Firebase Storage
   */
  async deleteFile(fileName) {
    try {
      const file = this.bucket.file(fileName);
      await file.delete();
      return { success: true, message: 'File deleted successfully' };
    } catch (error) {
      throw new Error(`File deletion failed: ${error.message}`);
    }
  }

  /**
   * Delete multiple files
   */
  async deleteFiles(fileNames) {
    try {
      const deletePromises = fileNames.map(fileName => this.deleteFile(fileName));
      return await Promise.all(deletePromises);
    } catch (error) {
      throw new Error(`Multiple file deletion failed: ${error.message}`);
    }
  }

  /**
   * Get file metadata
   */
  async getFileMetadata(fileName) {
    try {
      const file = this.bucket.file(fileName);
      const [metadata] = await file.getMetadata();
      return metadata;
    } catch (error) {
      throw new Error(`Failed to get file metadata: ${error.message}`);
    }
  }

  /**
   * Generate signed URL for temporary access
   */
  async generateSignedUrl(fileName, expires = Date.now() + 60 * 60 * 1000) {
    try {
      const file = this.bucket.file(fileName);
      const [signedUrl] = await file.getSignedUrl({
        action: 'read',
        expires: expires
      });
      return signedUrl;
    } catch (error) {
      throw new Error(`Failed to generate signed URL: ${error.message}`);
    }
  }
}

module.exports = new StorageService();
