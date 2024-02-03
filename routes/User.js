const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const Customer = require('../models/Customer');  // Import the Customer model
const Admin = require('../models/Admin');        // Import the Admin model
const SuperAdmin = require('../models/SuperAdmin');// Import the SuperAdmin model
const Seller = require('../models/Seller');      // Import the Seller model

// Common signup route for Admin, SuperAdmin, and Seller
router.post('/signup', async (req, res) => {
    try {
        const { name, email, password, dob } = req.body;
        // You can add additional validation if needed

        // Hash the password
        const hashedPassword = await bcrypt.hash(password, 10);

        // Choose the appropriate model based on the user type
        const userType = req.body.type; // Assuming you have a userType field in the request body

        switch (userType) {
            case 'Admin':
                const newAdmin = {
                    name,
                    email,
                    password: hashedPassword,
                    dob,
                };

                const admin = new Admin(newAdmin);

                // Save the admin to the database
                await admin.save();


                return res.status(201).json({ message: 'Admin registered successfully' });

                break;
            case 'Super Admin':
                const newSuperAdmin = {
                    name,
                    email,
                    password: hashedPassword,
                    dob,
                };

                const superAdmin = new SuperAdmin(newSuperAdmin);

                // Save the super admin to the database
                await superAdmin.save();

                return res.status(201).json({ message: 'Super Admin registered successfully' });
                break;
            case 'Seller':
                const newSeller = new Seller({
                    name,
                    email,
                    password: hashedPassword,
                    dob,
                });

                // Save the seller to the database
                await newSeller.save();


                return res.status(201).json({ message: 'Seller registered successfully' });

                break;
            default:
                return res.status(400).json({ error: 'Invalid user type' });
        }
    } catch (error) {
        console.error(error);
        return res.status(500).json({ error: error.message });
    }
});

// Customer signup route
router.post('/signup/customer', async (req, res) => {
    try {
        const { name, email, password, dob, addresses, paymentMethods } = req.body;

        // Hash the password
        const hashedPassword = await bcrypt.hash(password, 10);

        // Create a new customer
        const newCustomer = new Customer({
            name,
            email,
            password: hashedPassword,
            dob,
            addresses,
            paymentMethods,
        });

        // Save the customer to the database
        await newCustomer.save();

        res.status(201).json({ message: 'Customer registered successfully' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});





// Common signin route for SuperAdmin
router.post('/signin/superadmin', async (req, res) => {
    try{
        const { email, password } = req.body;

        // Find the admin by email
        const superadmin = await SuperAdmin.findOne({ email });

        // Check if the admin exists
        if (!superadmin) {
            return res.status(401).json({ error: 'Invalid credentials' });
        }

        // Check if the password is correct
        const isPasswordValid = await bcrypt.compare(password, superadmin.password);

        if (!isPasswordValid) {
            return res.status(401).json({ error: 'Invalid credentials' });
        }
    

        // Generate a JWT token
        const token = jwt.sign({name: superadmin.name, type: 'SuperAdmin'}, 'your_secret_key', { expiresIn: '1h' }); // Replace with your actual secret key
        console.log(token);

        return res.status(200).json({ token });

    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

// Common signin route for Admin
router.post('/signin/admin', async (req, res) => {
    try{
        const { email, password } = req.body;

        // Find the admin by email
        const admin = await Admin.findOne({ email });

        // Check if the admin exists
        if (!admin) {
            return res.status(401).json({ error: 'Invalid credentials' });
        }

        if (admin.block) {
            return res.status(401).json({ error: 'You are blocked by superadmin' });
        }

        // Check if the password is correct
        const isPasswordValid = await bcrypt.compare(password, admin.password);

        if (!isPasswordValid) {
            return res.status(401).json({ error: 'Invalid credentials' });
        }

        // Generate a JWT token
        const token = jwt.sign({name: admin.name, type: 'Admin'}, 'your_secret_key', { expiresIn: '1h' }); // Replace with your actual secret key

        return res.status(200).json({ token,admin });

    } catch (error) {
        console.error(error);
        return res.status(500).json({ error: 'Internal Server Error' });
    }
});

// Common signin route for Seller
router.post('/signin/seller', async (req, res) => {
    try{
        const { email, password } = req.body;

        // Find the seller by email
        const seller = await Seller.findOne({ email });

        // Check if the seller exists
        if (!seller) {
            return res.status(401).json({ error: 'Invalid credentials' });
        }

        if (seller.block) {
            return res.status(401).json({ error: 'You are blocked by admin' });
        }


        // Check if the password is correct
        const isPasswordValid = await bcrypt.compare(password, seller.password);

        if (!isPasswordValid) {
            return res.status(401).json({ error: 'Invalid credentials' });
        }

        // Generate a JWT token
        const token = jwt.sign({name: seller.name, type: 'Seller', id: seller._id}, 'your_secret_key', { expiresIn: '1h' }); // Replace with your actual secret key
        res.status(200).json({ token });

    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

// Customer signin route
router.post('/signin/customer', async (req, res) => {
    try {
        const { email, password } = req.body;

        // Find the customer by email
        const customer = await Customer.findOne({ email });

        // Check if the customer exists
        if (!customer) {
            return res.status(401).json({ error: 'Invalid credentials' });
        }

        if(customer.block){
            return res.status(401).json({ error: 'You are blocked by admin' });
        }

        // Check if the password is correct
        const isPasswordValid = await bcrypt.compare(password, customer.password);

        if (!isPasswordValid) {
            return res.status(401).json({ error: 'Invalid credentials' });
        }

        // Generate a JWT token
        const token = jwt.sign({ name: customer.name, type: 'Customer', id: customer._id }, 'your_secret_key', { expiresIn: '1h' }); // Replace with your actual secret key

        res.status(200).json({ token });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});



module.exports = router;