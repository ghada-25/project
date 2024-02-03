const mongoose = require('mongoose');

const advertisementSchema = new mongoose.Schema({
    name: { type: String, required: true },
    image: {
        data: Buffer,
        contentType: String
    }
});

const Advertisement = mongoose.model('Advertisement', advertisementSchema);

module.exports = Advertisement;