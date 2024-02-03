const mongoose = require('mongoose');

const voucherSchema = new mongoose.Schema({
    voucher_code: { type: String, required: true, unique: true },
    is_used: { type: Boolean, default: false },
    discount: { type: Number, required: true },
    expiry_date: { type: Date, required: true },

});

const Voucher = mongoose.model('Voucher', voucherSchema);

module.exports = Voucher;