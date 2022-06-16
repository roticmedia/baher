const path = require("path");

const validateFileType = (file) => {
    const filetypes = /jpeg|jpg|png/;
    const extname = filetypes.test(
        path.extname(file.originalname).toLowerCase()
    );
    const mimetype = filetypes.test(file.mimetype);

    return mimetype && extname;
};

module.exports = {
    validateFileType
};
