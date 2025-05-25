import mime from 'mime';
import fs from 'fs';
import fsPromises from 'fs/promises';
import FormData from 'form-data';
import axios from 'axios';

async function getLocalFileSize(filePath) {
  try {
    const stats = await fsPromises.stat(filePath);
    return stats.size; // size in bytes
  } catch (error) {
    console.error("Failed to get file stats:", error);
    return null;
  }
}

export async function internalUpload(filePath, fileName, apiKey, ID, fileSizeRestrict = true) {
  const maxBytes = 5 * 1024 * 1024;
  const fileSize = await getLocalFileSize(filePath);

  if (fileSize !== null && fileSize > maxBytes && fileSizeRestrict) {
    console.error(`🛑 File is ${(fileSize / (1024 * 1024)).toFixed(2)}MB, which exceeds the 5MB Notion limit.`);
    return null;
  }

  console.log("🧪 Uploading with:", { filePath, fileName, apiKey, ID });

  const form = new FormData();
  form.append('file', fs.createReadStream(filePath), {
    filename: fileName,
    contentType: mime.getType(fileName) || 'application/octet-stream',
  });

  const url = `https://api.notion.com/v1/file_uploads/${ID}/send`;

  try {
    const response = await axios.post(url, form, {
      headers: {
        ...form.getHeaders(),
        Authorization: `Bearer ${apiKey}`,
        'Notion-Version': '2022-06-28',
      },
      maxContentLength: Infinity,
      maxBodyLength: Infinity,
    });

    console.log('✅ Upload successful! File ID:', response.data.id);
    return response.data.id;
  } catch (error) {
    console.error('❌ Upload failed:', error.response?.status, error.response?.data || error.message);
    return null;
  }
}