const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const middleware = require('../middleware/middleware.js');
const Order = require('../models/Order.js'); // Correct import to Order model
const Customer = require('../models/Customer.js');
const bcrypt = require('bcrypt');

const app = express();
app.use(cors());
app.use(express.json());

//app.use(middleware); // This will be used for all the routes in this file

mongoose.connect('mongodb://0.0.0.0:27017/paisa', {
    useNewUrlParser: true,
});

const PORT = process.env.PORT || 3000;

// CREATE: POST endpoint to create a new order
app.post('/orders', async (req, res) => {
    try {
        const { customer, products, sizes, price, feedback, rating } = req.body;

        // Validate customer, products, and ensure they exist in the database
        const existingCustomer = await Customer.findById(customer);
        if (!existingCustomer) {
            return res.status(404).json({ error: 'Customer not found' });
        }

        // Assuming Product model is available
        const existingProducts = await Product.find({ _id: { $in: products } });
        if (existingProducts.length !== products.length) {
            return res.status(404).json({ error: 'One or more products not found' });
        }

        // Create a new order
        const newOrder = new Order({
            customer,
            products,
            sizes,
            price,
            feedback,
            rating
        });

        // Save the order to the database
        await newOrder.save();

        res.status(201).json({ message: 'Order created successfully', order: newOrder });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

app.get('/orders', async (req, res) => {
    try {
        const customers = await Order.find();
        res.status(200).json(customers);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// READ: GET endpoint to retrieve a specific order by ID
app.get('/orders/:orderId', async (req, res) => {
    try {
        const order = await Order.findById(req.params.orderId);
        if (!order) {
            return res.status(404).json({ error: 'Order not found' });
        }
        res.status(200).json(order);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

app.patch('/orders/:orderId', async (req, res) => {
    try {
        const allowedUpdates = ['sizes', 'price', 'feedback', 'rating'];
        const updates = Object.keys(req.body);
        const isValidOperation = updates.every(update => allowedUpdates.includes(update));

        if (!isValidOperation) {
            return res.status(400).json({ error: 'Invalid updates!' });
        }

        const order = await Order.findByIdAndUpdate(
            req.params.orderId,
            req.body,
            { new: true, runValidators: true }
        );

        if (!order) {
            return res.status(404).json({ error: 'Order not found' });
        }

        res.status(200).json(order);
    }
    catch (error) {
        console.error(error);
        res.status(400).json({ error: error.message });
    }
});

// DELETE: DELETE endpoint to delete a specific order by ID
app.delete('/orders/:orderId', async (req, res) => {
    try {
        const order = await Order.findByIdAndDelete(req.params.orderId);
        if (!order) {
            return res.status(404).json({ error: 'Order not found' });
        }
        res.status(200).json(order);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});