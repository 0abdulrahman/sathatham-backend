"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = handleRequestFiles;
/**
 * Handles files uploaded via Multer and adds their filenames to a data object.
 *
 * @param {Request} req - The Express request object, which contains the files uploaded via Multer.
 * @param {Object} dataObject - The object to which the file names will be added.
 */
function handleRequestFiles(req, dataObject, fields) {
    if (req.files && Object.keys(req.files).length > 0) {
        // Iterate over each field in the req.files object
        fields.forEach((field) => {
            // Prepare the files found in the current field in the loop
            const files = req.files[field.name];
            if (files === null || files === void 0 ? void 0 : files.length) {
                if (!field.multiple) {
                    // If it's just one file, don't create an array and place the file name directly
                    dataObject[field.name] = files[0].filename;
                }
                else {
                    // If there are more than one, create an array that contains the images urls
                    // to match the structure of the embedded gallery document gallery: [{ _id: ObjectId, url: string }]
                    dataObject[field.name] = files.map((file) => {
                        return { url: file.filename };
                    });
                }
            }
        });
    }
    else if (req.file) {
        // If the field receives a single file, access the file from `req.file` instead
        dataObject[fields[0].name] = req.file.filename;
    }
}
