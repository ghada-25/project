const mongoose = require('mongoose');

const socialMediaSchema = new mongoose.Schema({
    site: { type: String, required: true }, 
    link: { type: String, required: true },
    icon: {
        data: Buffer,
        contentType: String
    }
});

const SocialMedia = mongoose.model('SocialMedia', socialMediaSchema);
module.exports = SocialMedia;