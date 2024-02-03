
const mongoose = require('mongoose');

const paymentSchema = new mongoose.Schema({
    customer_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Customer',
        required: true
    },
    order_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Order',
        required: true
    },
    paymentMethod: {
        type: String,
        required: true
    },
    completed: {
        type: Boolean,
        default: false
    }
});

const Payment = mongoose.model('Payment', paymentSchema);

module.exports = Payment;