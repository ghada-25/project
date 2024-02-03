const mongoose = require('mongoose');

const adminSchema = new mongoose.Schema({
    name: { type: String, required: true },
    email: { type: String, required: true, unique:true },
    password: { type: String, required: true },
    dob: { type: Date, required: true },
    block: { type: Boolean, default: false }
});

const Admin = mongoose.model('Admin', adminSchema);
module.exports = Admin;