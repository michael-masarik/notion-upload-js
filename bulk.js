import { notionUpload } from './main.js';
async function bulkUpload(json, apiKey, fileSizeRestrict = true) {
    const results = [];
    let index = 0;

    async function worker() {
        while (index < json.files.length) {
            const currentIndex = index++;
            const file = json.files[currentIndex];
            try {
                const finalID = await notionUpload(file.path, file.name, apiKey, fileSizeRestrict);
                results[currentIndex] = finalID;
                console.log(`✅ Uploaded ${file.name} → ${finalID}`);
            } catch (error) {
                results[currentIndex] = null;
                console.error(`❌ Failed to upload ${file.name}:`, error);
            }
        }
    }

    const concurrencyLimit = 3;
    const workers = Array.from({ length: concurrencyLimit }, () => worker());
    await Promise.all(workers);

    return results;
}
export { bulkUpload }