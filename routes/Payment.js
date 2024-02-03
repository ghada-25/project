const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const middleware = require('../middleware/middleware.js');
const Order = require('../models/Order.js');
const Customer = require('../models/Customer.js');
const Payment = require('../models/Payment.js');
const bcrypt = require('bcrypt');

const app = express();
app.use(cors());
app.use(express.json());

//app.use(middleware); // This will be used for all the routes in this file

mongoose.connect('mongodb://0.0.0.0:27017/paisa', {
    useNewUrlParser: true,
});

const PORT = process.env.PORT || 3000;

// CREATE: POST endpoint to create a new payment
app.post('/payments', async (req, res) => {
    try {
        const { customer_id, order_id, paymentMethod, completed } = req.body;

        // Validate customer_id and order_id, ensure they exist in the database
        const existingCustomer = await Customer.findById(customer_id);
        if (!existingCustomer) {
            return res.status(404).json({ error: 'Customer not found' });
        }

        const existingOrder = await Order.findById(order_id);
        if (!existingOrder) {
            return res.status(404).json({ error: 'Order not found' });
        }

        // Create a new payment
        const newPayment = new Payment({
            customer_id,
            order_id,
            paymentMethod,
            completed
        });

        // Save the payment to the database
        await newPayment.save();

        res.status(201).json({ message: 'Payment created successfully', payment: newPayment });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

// READ: GET endpoint to retrieve all payments
app.get('/payments', async (req, res) => {
    try {
        const payments = await Payment.find().populate('customer_id order_id');
        res.status(200).json(payments);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

// READ: GET endpoint to retrieve a specific payment by ID
app.get('/payments/:paymentId', async (req, res) => {
    try {
        const payment = await Payment.findById(req.params.paymentId).populate('customer_id order_id');
        if (!payment) {
            return res.status(404).json({ error: 'Payment not found' });
        }
        res.status(200).json(payment);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

// UPDATE: PATCH endpoint to update a specific payment by ID
app.patch('/payments/:paymentId', async (req, res) => {
    try {
        const allowedUpdates = ['paymentMethod', 'completed'];
        const updates = Object.keys(req.body);
        const isValidOperation = updates.every(update => allowedUpdates.includes(update));

        if (!isValidOperation) {
            return res.status(400).json({ error: 'Invalid updates!' });
        }

        const payment = await Payment.findByIdAndUpdate(
            req.params.paymentId,
            req.body,
            { new: true, runValidators: true }
        ).populate('customer_id order_id');

        if (!payment) {
            return res.status(404).json({ error: 'Payment not found' });
        }

        res.status(200).json(payment);
    } catch (error) {
        console.error(error);
        res.status(400).json({ error: error.message });
    }
});

// DELETE: DELETE endpoint to delete a specific payment by ID
app.delete('/payments/:paymentId', async (req, res) => {
    try {
        const payment = await Payment.findByIdAndDelete(req.params.paymentId).populate('customer_id order_id');
        if (!payment) {
            return res.status(404).json({ error: 'Payment not found' });
        }
        res.status(200).json(payment);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

// Start the server
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});