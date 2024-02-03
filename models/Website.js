const mongoose = require('mongoose');

const websiteSchema = new mongoose.Schema({ 
    gst: { type: Number , required: true, default: 0},
    standard_shipping: { type: Number, required: true , default: 0},
    express_shipping: { type: Number, required: true , default: 0},
});

const Website = mongoose.model('Website', websiteSchema);
module.exports = Website;