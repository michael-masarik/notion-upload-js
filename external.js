import fetch from 'node-fetch';  // npm install node-fetch@2  (v3+ is ESM only, adapt if needed)
import FormData from 'form-data';

/**
 * Get file size in bytes by making a HEAD request.
 * Returns null if Content-Length not provided.
 */
export async function getFileSizeFromURL(fileURL) {
    try {
        const response = await fetch(fileURL, { method: 'HEAD' });
        if (!response.ok) {
            throw new Error(`Failed to fetch headers. Status: ${response.status}`);
        }
        const contentLength = response.headers.get("content-length");
        return contentLength ? parseInt(contentLength, 10) : null;
    } catch (error) {
        console.error("🌐 Failed to get file size:", error);
        return null;
    }
}

/**
 * Upload external file by URL to Notion via upload session ID.
 * Respects 5MB file size limit by default (can be overridden).
 */
export async function externalUpload(fileURL,  fileName, apiKey, ID, fileSizeRestrict = true) {
    const maxBytes = 5 * 1024 * 1024;

    // Check file size first
    const fileSize = await getFileSizeFromURL(fileURL);
    if (fileSize !== null && fileSize > maxBytes && fileSizeRestrict) {
        console.error(`🛑 File is ${(fileSize / (1024 * 1024)).toFixed(2)}MB, which exceeds the 5MB Notion limit.`);
        return null;
    }

    // Fetch file content as Buffer
    const response = await fetch(fileURL);
    if (!response.ok) {
        console.error(`📥 Failed to download the file: ${response.status}`);
        return null;
    }
    const buffer = await response.buffer();

    // Prepare multipart/form-data
    const formData = new FormData();
    formData.append('file', buffer, { filename: fileName });

    // Compose upload URL and headers
    const uploadURL = `https://api.notion.com/v1/file_uploads/${ID}/send`;
    const headers = {
        ...formData.getHeaders(),
        "Authorization": `Bearer ${apiKey}`,
        "Notion-Version": "2022-06-28"
    };

    // Upload file
    const uploadResponse = await fetch(uploadURL, {
        method: 'POST',
        headers,
        body: formData
    });

    const result = await uploadResponse.json();

    if (uploadResponse.ok) {
        console.log("✅ Upload successful! File ID:", result.id);
        return result.id;
    } else {
        console.error("❌ Upload failed:", uploadResponse.status, result);
        return null;
    }
}