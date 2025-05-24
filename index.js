import mime from 'mime';
import os from 'os';
import { readFile } from 'fs/promises';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path'; 

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
function validate(filePath, apiKey,fileName){
    const mimeType  = mime.getType(filePath);
    const fileExtension = mime.getExtension(fileName);
    var errors = [];
    if (logging) {
        console.log('Validating file...');
    }
    if (filePath === undefined || filePath === null || filePath === '') {
        errors.push('File path is required');
    }
    if (apiKey === undefined || apiKey === null || apiKey === '') {
        errors.push('API key is required');
    }
    if (fileName === undefined || fileName === null || fileName === '') {
        errors.push('File name is required');
    }
    if (mime.getExtension(mimeType) =! fileExtension) {
        errors.push('File extension does not match MIME type');
    }
    if (errors.length > 0) {
        console.log("🛑 The following errors where found:")
        for (const error of errors) {
        console.log("❌", error);
        }
    }
    return errors
}
//Determine location
function location(filePath){
    if (logging){
        console.log('Determining location...');
    }
    const regex = /^(http|https):\/\//;
    if (regex.test(filePath)) {
        return 'url';
    } else {
        return 'local';
    }

}
//Start Upload
async function startUpload(filePath, apiKey, fileName) {
    if (logging) {
        console.log('Starting initial upload...');
    }

    const mimeType = mime.getType(filePath);

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
        console.log("🚀 Upload successfully started! File ID:", fileID);
        return fileID;
    } else {
        console.log("❌ Upload failed:", response.status, result);
        return null;
    }
}

async function notionUpload(filePath, apiKey, fileName){
    const validated = validate(filePath, apiKey, fileName);
    if (validated.length > 0) {
    return;
    }
    startUpload(filePath, apiKey, fileName)
    .then((fileID)=>{
       //still working on this 
    })
}
export { notionUpload};