const mongoose = require('mongoose');

const superadminSchema = new mongoose.Schema({
    name: { type: String, required: true },
    email: { type: String, required: true, unique:true },
    password: { type: String, required: true },
    dob: { type: Date, required: true }
});

const SuperAdmin = mongoose.model('SuperAdmin', superadminSchema);

module.exports = SuperAdmin;