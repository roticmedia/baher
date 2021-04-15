const multer = require('multer');
const path = require('path');

const storage = multer.diskStorage({
    destination: './public/uploads/',
    onError(err, next) {
        console.log('error', err);
        next();
    },
    filename(req, file, cb) {
        cb(null, `${file.fieldname}-${Date.now()}${path.extname(file.originalname)}`);
    },
});

module.exports = () => multer({
    storage,
}).single('picture');
