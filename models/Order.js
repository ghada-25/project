const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema({
    customer: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Customer',
    },
    customerName: {
        type: String,

    },
    products: [{
        type: String,

    }],
    sizes: [{
        type: String
    }],
    price: {
        type: Number,

    },
    feedback: {
        type: String
    },
    rating: {
        type: Number,
        min: 1,
        max: 5
    },
    status: {
        type: String,
        enum: ['Pending', 'Confirmed', 'Delivered', 'Cancelled'],
        default: 'Pending'
    },
    seller_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Seller',

    },
    order_date: {
        type: Date,
        default: Date.now
    },
    payment_status: {
        type: String,
        enum: ['Pending', 'Paid'],
        default: 'Pending'
    },
    payment_mode: {
        type: String,
        enum: ['COD', 'Online'],
        default: 'COD'
    },
});

const Order = mongoose.model('Order', orderSchema);

module.exports = Order;