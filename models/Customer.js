const mongoose = require('mongoose');

const customerSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    password: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true,
        unique: true
    },
    dob: {
        type: Date,
        required: true
    },
    addresses: [{
        type: String
    }],
    paymentMethods: [{
        cardDetails: {
            type: String,
            required: true
        }
    }],
    block: {
        type: Boolean,
        default: false
    },
    favourites: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Product'
    }]
});


const Customer = mongoose.model('Customer', customerSchema);

module.exports = Customer;