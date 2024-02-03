
const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const Customer = require('../models/Customer');
const Order = require('../models/Order');
const Design = require('../models/Design');
const Product = require('../models/Product');
const express = require('express');
const router = express.Router();

//get products
router.get('/products', async (req, res) => {
    try {
        const products = await Product.find({});
        console.log(products);

        const productswithImage = products.map(product => {
            const image = product.img[0].data.toString('base64');
            const contentType = product.img.contentType;
            return {
                _id: product._id,
                name: product.name,
                price: product.price,
                description: product.description,
                img : {
                    data: image,
                    contentType: contentType
                },
                seller_id: product.seller_id,
                category: product.category,
                sizes: product.size,
                stock: product.qty,
            }
        }
        );
        res.status(200).json({ products: productswithImage });
    } catch (error) {
        res.status(500).json({ error: error.message });
        console.log(error);
    }
});

//fetch product by id
router.get('/products/:productId', async (req, res) => {
    try {
        const product = await Product.findById(req.params.productId);
        if (!product) {
            return res.status(404).json({ error: 'Product not found' });
        }
        const image = product.img[0].data.toString('base64');
        const contentType = product.img.contentType;
        const productwithImage = {
            _id: product._id,
            name: product.name,
            price: product.price,
            description: product.description,
            img : {
                data: image,
                contentType: contentType
            },
            seller_id: product.seller_id,
            category: product.category,
            sizes: product.size,
            stock: product.qty,
        }
        res.status(200).json(productwithImage);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

//place order
router.post('/placeorder', async (req, res) => {
    try {
        const { customer, products, sizes, price,customerName } = req.body;
        const newOrder = new Order({
            customer,
            products,
            sizes,
            price,
            // seller_id,
            customerName
        });
        await newOrder.save();
        return res.status(201).json({ message: 'Order placed successfully' });
    } catch (err) {
        return res.status(500).json({ error: err.message });
    }
});

//rate order
router.post('/rateorder', async (req, res) => {
    try {
        const { orderId, rating, feedback } = req.body;
        const order = await Order.findById(orderId);
        order.rating = rating;
        order.feedback = feedback;
        await order.save();
        return res.status(201).json({ message: 'Order rated successfully' });
    } catch (err) {
        return res.status(500).json({ error: err.message });
    }
});

//get orders
router.post('/getorders', async (req, res) => {
    try {
        const { customerId } = req.body;
        const orders = await Order.find({ customer: customerId });
        return res.status(201).json({ orders });
    } catch (err) {
        return res.status(500).json({ error: err.message });
    }
});

//get order
router.post('/getorder', async (req, res) => {
    try {
        const { orderId } = req.body;
        const order = await Order.findById(orderId);
        return res.status(201).json({ order });
    } catch (err) {
        return res.status(500).json({ error: err.message });
    }
});

//cancel order
router.put('/cancelorder', async (req, res) => {
    try {
        const { orderId } = req.body;
        const order = await Order.findById(orderId);
        order.status = 'Cancelled';
        await order.save();
        return res.status(201).json({ message: 'Order cancelled successfully' });
    } catch (err) {
        return res.status(500).json({ error: err.message });
    }
});

router.post('/customers', async (req, res) => {
    try {
        const { name, email, password, dob, addresses, paymentMethods, block } = req.body;
        const hashedPassword = await bcrypt.hash(password, 10);
        const newCustomer = new Customer({
            name,
            email,
            password: hashedPassword,
            dob,
            addresses,
            paymentMethods,
            block,
        });
        await newCustomer.save();

        res.status(201).json({ message: 'Customer registered successfully' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

router.get('/customers', async (req, res) => {
    try {
        const customers = await Customer.find();
        res.status(200).json(customers);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

router.get('/customers/:customerId', async (req, res) => {
    try {
        const customer = await Customer.findById(req.params.customerId);
        if (!customer) {
            return res.status(404).json({ error: 'Customer not found' });
        }
        res.status(200).json(customer);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

router.patch('/customers/:customerId', async (req, res) => {
    try {
        const allowedUpdates = ['name', 'password', 'email', 'dob', 'addresses', 'paymentMethods', 'block', 'favourites'];
        const updates = Object.keys(req.body);
        const isValidOperation = updates.every(update => allowedUpdates.includes(update));

        if (!isValidOperation) {
            return res.status(400).json({ error: 'Invalid updates!' });
        }

        const customer = await Customer.findByIdAndUpdate(
            req.params.customerId,
            req.body,
            { new: true, runValidators: true }
        );

        if (!customer) {
            return res.status(404).json({ error: 'Customer not found' });
        }

        res.status(200).json(customer);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});

router.delete('/customers/:customerId', async (req, res) => {
    try {
        const customer = await Customer.findByIdAndDelete(req.params.customerId);
        if (!customer) {
            return res.status(404).json({ error: 'Customer not found' });
        }
        res.status(200).json(customer);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

//add design
router.post('/adddesign', async (req, res) => {

    const {name, image} = req.body;

    const img = {
        data: Buffer.from(image, 'base64'),
        contentType: 'image/png'
    }

    const newDesign = new Design({
        customer_name: name,
        image: img
    });

    await newDesign.save();

    res.status(201).json({ message: 'Design added successfully' });

});

//get designs
router.get('/getdesigns', async (req, res) => {
    try {
        const designs = await Design.find({});

        const designwithImage = designs.map(design => {
            const image = design.image.data.toString('base64');
            return {
                name: design.customer_name,
                image
            }
        });

        res.status(200).json({ designs:designwithImage });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});



module.exports = router;