

# notion-upload-js

A lightweight JS package to upload files—both local and remote—to Notion via the [Notion API](https://developers.notion.com/). Supports internal (local) and external (URL-based) file uploads, with added support for bulk uploading multiple files at once.

## Features

* ✅ Upload local files to Notion
* 🌐 Upload files from remote URLs
* 📁 MIME type validation
* ❌ Basic error checking and reporting
* 🔒 Uses Bearer token authentication
* 📦 Optional 5MB file size enforcement (enabled by default)
* 📤 Bulk upload multiple files in a single call
* 📋 Returns Notion file IDs for uploaded files

## Installation

```bash
npm i notion-upload-js
```

## Usage

### Single File Upload Example

```js
import {notionUpload} from notion-upload-js

NOTION_KEY = "your_notion_api_key"

//Internal
var uploader = await notionUpload("internal.jpg","internal.jpg", NOTION_KEY)
console.log(uploader);
//External
var uploader = await notionUpload("https://example.com/image.png","external.png", NOTION_KEY);
console.log(uploader);
//Remove file size limit
var uploader = await notionUpload("internal.jpg","internal.jpg", NOTION_KEY, false)
console.log(uploader);
```

### Bulk Upload Example

```js
import {bulkUpload} from notion-upload-js

NOTION_KEY = "your_notion_api_key"
    

var files_to_upload = {
        "files": [
            {
                "path": "internal.jpg",
                "name": "internal.jpg"
            },
            {
                "path": "https://example.com/image.png",
                "name": "external.png"
            }
        ]
    }

var uploader = await bulkUpload(files_to_upload, NOTION_KEY);
console.log(uploader);
```

## File Types

Supported file types depend on the Notion API. Common formats like PDFs, images, and documents should work. To see which file types are allowed, view the `mime_types.json` file. 

## Validation

* Ensures a Notion API key is provided
* Validates that the file extension matches the inferred MIME type
* Validates that the MIME type is the supported in Notion
* Optionally enforces Notion's 5MB upload limit (can be disabled)
* Prints clear, user-friendly errors on failure

## Notes

* For external uploads, the file is downloaded temporarily and deleted after the upload
* Make sure your Notion integration has appropriate permissions for file uploads
* By default, files larger than 5MB will raise an error. To override this, pass `fileSizeRestrict = false`.
* Bulk uploads return a list of Notion file IDs corresponding to each uploaded file.

## License

MIT License

## Contributing

Contributions are welcome! Feel free to fork the repo, submit pull requests, or open issues. See version notes below.

## Version Notes

Currently, this package supports single-part uploads and bulk upload of multiple files due to limitations of the free [Notion plan](https://www.notion.com/pricing). If you have access to a Business or Enterprise plan, feel free to contribute to the multi-part file upload!
