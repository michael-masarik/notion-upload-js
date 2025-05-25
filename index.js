import { notionUpload} from './main.js';
import { bulkUpload} from './bulk.js';
export {
    notionUpload,
    bulkUpload
}
/**
 * When you pass a JSON file to the bulkUpload function, it should be in the following format:
 *  {
        "files": [
            {"path": "file/path", "name": "name.txt"},
            {"path": "file/path2", "name": "name2.txt"}
        ]
    }
 */