import mime from 'mime';
import os from 'os';
import { readFile } from 'fs/promises';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path'; 
import {externalUpload} from './external.js';
import { internalUpload } from './internal.js';

//This is the var to change if you hate all the detailed logs.
const logging = true;
const uploadURL = "https://api.notion.com/v1/file_uploads";

// Cache MIME types
async function cacheMimeTypes() {
    if (logging) {
        console.log('Caching MIME types...');
    }

    const __filename = fileURLToPath(import.meta.url);
    const __dirname = dirname(__filename); // Fix here

    const filePath = join(__dirname, 'mime-types.json');

    const file = await readFile(filePath, 'utf-8');
    const jsonData = JSON.parse(file);
    return jsonData;
}

const MIME_TYPES = await cacheMimeTypes();

//Validation
function validate(filePath, apiKey,fileName, loc){
    const mimeType  = mime.getType(filePath);
    const fileExtension = mime.getExtension(fileName);
    var errors = [];
    if (logging) {
        console.log('Validating file...');
    }
    if (filePath === undefined || filePath === null || filePath === '') {
        errors.push('File path is required');
    }
    if (!mimeType) {
    errors.push('Could not determine MIME type from file path');
    }
    if (apiKey === undefined || apiKey === null || apiKey === '') {
        errors.push('API key is required');
    }
    if (fileName === undefined || fileName === null || fileName === '') {
        errors.push('File name is required');
    }
    if (MIME_TYPES.includes(mimeType) === false) {
        errors.push('MIME type is not supported');
    }
    if (errors.length > 0) {
        console.log("🛑 The following errors where found:")
        for (const error of errors) {
        console.log("❌", error);
        }
    }
    if (((mime.getExtension(mimeType)?.toLowerCase() || '') !== (fileExtension?.toLowerCase() || '')) && loc === "local") {
        if (logging) {
            console.warn(`⚠️ File extension "${fileExtension}" does not match MIME type "${mimeType}". Attempting to upload anyway.`);
        }
        // Don't block upload — just warn
    }
    return errors
    
}
async function getMimeTypeFromURL(url) {
    try {
        const response = await fetch(url, { method: 'HEAD' });
        return response.headers.get('content-type');
    } catch (e) {
        console.error("Failed to fetch MIME type from URL:", e);
        return null;
    }
}

//Start Upload
async function startUpload(filePath, apiKey, fileName, loc) {
    if (logging) {
        console.log('Starting initial upload...');
    }

    let mimeType;
    if (loc === "url") {
        mimeType = await getMimeTypeFromURL(filePath);
    } else {
        mimeType = mime.getType(filePath);
    }
    const response = await fetch(uploadURL, {
        method: 'POST',
        headers: {
            'accept': 'application/json',
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${apiKey}`,
            'Notion-Version': '2022-06-28'
        },
        body: JSON.stringify({
            'filename': fileName,
            'content_type': mimeType
        })
    });

    const result = await response.json();

    if (response.status === 200) {
        const fileID = result.id;
        console.log("📡 Upload successfully started! File ID:", fileID);
        return fileID;
    } else {
        console.log("❌ Upload failed:", response.status, result);
        return null;
    }
}

async function notionUpload(filePath, fileName, apiKey, fileSizeRestrict = true){
    console.log("Starting upload to Notion... If you would not like detailed logs, edit the main.js file and set the logging variable to false.")
    //Determine location
    function location(filePath){
        if (logging){
            console.log('📍 Determining location...');
        }
        const regex = /^(http|https):\/\//;
        if (regex.test(filePath)) {
            return 'url';
        } else {
            return 'local';
        }

    }
    var loc=location(filePath);
    const validated = validate(filePath, apiKey, fileName,loc);
    if (validated.length > 0) {
    return;
    }
    var ID = await startUpload(filePath, apiKey, fileName, loc);
    if (logging) {
        console.log('📍 Location:', loc);
    }
    let finalID;
    if (loc === "url") {
        finalID = await externalUpload(filePath, fileName, apiKey, ID, fileSizeRestrict);
    } else {
        finalID = await internalUpload(filePath, fileName, apiKey, ID, fileSizeRestrict);
    }

    if (finalID == null) {
        console.log("❌ Upload failed.");
    }
    return finalID;
    }
// Export the function
export { notionUpload};