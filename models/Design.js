const mongoose = require('mongoose');

const designSchema = new mongoose.Schema({
    customer_name: { type: String, required: true },
    image : {
        data: Buffer,
        contentType: String
    },
});

const Design = mongoose.model('Design', designSchema);

module.exports = Design;