const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const fs = require('fs');
const path = require('path');
const bcrypt = require('bcrypt');
const multer = require('multer');
const Product = require('../models/Product');
const Order = require('../models/Order');
const Payment = require('../models/Payment');
const Seller = require('../models/Seller');
const { verifySellerToken } = require('../middleware/VerifySellerToken');

//update profile
router.put('/updateProfile', verifySellerToken, async (req, res) => {
    try {
        const { name, email, password } = req.body;

        const token = req.header('Authorization');
        const decoded = jwt.verify(token, 'your_secret_key');
        const sellerId = decoded.id;

        const hashedPassword = await bcrypt.hash(password, 10);
        const seller = await Seller.findOne({ _id: sellerId });

        if (seller) {
            seller.name = name;
            seller.email = email;
            seller.password = hashedPassword;

            await seller.save();
        }
        const tokennew = jwt.sign({name: seller.name, type: 'Seller', id: seller._id}, 'your_secret_key', { expiresIn: '1h' }); // Replace with your actual secret key


        return res.status(201).json({ message: 'Profile updated successfully' , tokennew});
    } catch (error) {
        console.log(error);
    }
}
);


//get profile
router.get('/getProfile', verifySellerToken, async (req, res) => {
    try {
        const token = req.header('Authorization');
        const decoded = jwt.verify(token, 'your_secret_key');

        const seller = await Seller.findOne({ _id: decoded.id });

        res.status(200).json({ seller });
    } catch (error) {
        console.log(error);
    }
}
);

//-----------------------------PRODUCT--------------------------------------------

// Multer configuration
const storage = multer.memoryStorage(); // Store the image in memory
const upload = multer({ storage: storage });

router.get('/getAllProducts', async (req, res) => {
    try {
      const token = req.header('Authorization');
        const decoded = jwt.verify(token, 'your_secret_key');
        const sellerId = decoded.id;
  
      // Fetch all products for the seller
      const products = await Product.find({ seller_id: sellerId });
  
      if (!products || products.length === 0) {
        return res.status(404).json({ message: 'No products found' });
      }
  
      // Customize the response to include product details and images
      const productsWithImages = products.map(product => {
        return {
          name: product.name,
          price: product.price,
          description: product.description,
          category: product.category,
          quantity: product.qty,
          images: product.img.map(img => ({
            contentType: img.contentType,
            data: img.data.toString('base64'), // Convert image data to base64
          })),
          active: product.active,
          approval: product.approval,
          discount: product.discount,
          // Add other product details as needed
        };
      });
  
      res.status(200).json({ products: productsWithImages });
    } catch (error) {
      console.log(error);
      res.status(500).json({ error: 'Internal Server Error' });
    }
  });
  
// add product
router.post('/addProduct', async (req, res) => {
    try {
        const { name, price, description, category, quantity } = req.body;
        console.log(name, price, description, category, quantity);

        const token = req.header('Authorization');
        const decoded = jwt.verify(token, 'your_secret_key');
        const sellerId = decoded.id;


        const newProduct = {
            prod_code: name + sellerId,
            name,
            price,
            description,
            category,
            qty: quantity,
            seller_id: sellerId,
        };

        const product = new Product(newProduct);

        // Save the product to the database
        await product.save();

        res.status(201).json({ message: 'Product added successfully' });
    } catch (error) {
        console.log(error);
    }
}
);

//add image to product using multer
router.put('/addImgToProduct', async (req, res) => {
    try {
        const { name, image } = req.body;

        const token = req.header('Authorization');
        const decoded = jwt.verify(token, 'your_secret_key');
        const sellerId = decoded.id;

        console.log(name, sellerId);

        const product = await Product.findOne({ name: name, seller_id: sellerId });

        if (!product) {
            return res.status(400).json({ message: 'Product not found' });
        }

        if (image) {
            const img = {
                data: Buffer.from(image, 'base64'), // Decode base64 image data
                contentType: 'image/png', // Update with the actual content type
            };

            console.log(img);

            product.img.push(img);
            await product.save();
        } else {
            return res.status(400).json({ message: 'Image data not provided' });
        }

        res.status(201).json({ message: 'Image added successfully' });
    } catch (error) {
        console.log(error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

// add image to product
router.post('/addImageToProduct', async (req, res) => {
    if (!req.files) {
        return res.status(400).json({ message: 'No files were uploaded' });
    }

    const file = req.files.file;
    const fileName = file.name;
    const uploadPath = path.join(__dirname, '../public/images', fileName);
    const dbPath = '/images/' + fileName;

    try {
        file.mv(uploadPath, async (error) => {
            if (error) {
                console.error(error);
                return res.status(500).json({ message: 'Error uploading image' });
            }

            // Get the product name from the request body
            const { name } = req.body;

            // Find the product by name
            const product = await Product.findOne({ name: name });

            if (!product) {
                return res.status(404).json({ message: 'Product not found' });
            }

            // Add the image path to the product
            product.images.push(dbPath);

            // Save the product to the database
            await product.save();

            res.status(201).json({ message: 'Image uploaded successfully' });
        });
    }
    catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Internal Server Error' });
    }
}
);

// delete image from product
router.delete('/deleteImageFromProduct', async (req, res) => {
    try {
        const { name, image } = req.body;

        // Find the product by name
        const product = await Product.findOne({ name: name });

        if (!product) {
            return res.status(404).json({ message: 'Product not found' });
        }

        // Delete the image from the server
        const imagePath = path.join(__dirname, '../public', image);
        fs.unlinkSync(imagePath);

        // Remove the image path from the product
        product.images = product.images.filter((img) => img !== image);

        // Save the product to the database
        await product.save();

        res.status(201).json({ message: 'Image deleted successfully' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Internal Server Error' });
    }
}
);

// update product


// deactivate product
router.put('/deactivateProduct', verifySellerToken, async (req, res) => {
    try {
        const { name } = req.body;

        console.log(name);
        const product = await Product.findOne({ name: name });

        if (product) {
            product.active = false;
            await product.save();
            console.log(product);

        }

        return res.status(201).json({ message: 'Product deactivated successfully' });
    } catch (error) {
        console.log(error);
        return res.status(500).json({ message: 'Internal Server Error' });

    }
}
);

// activate product
router.put('/activateProduct', verifySellerToken, async (req, res) => {
    try {
        const { name } = req.body;

        const product = await Product.findOne({ name: name });

        if (product) {
            product.active = true;

            await product.save();
        }

        return res.status(201).json({ message: 'Product activated successfully' });
    } catch (error) {
        console.log(error);
        return res.status(500).json({ message: 'Internal Server Error' });

    }
}
);

// view all products
router.get('/viewAllProductsForSeller', async (req, res) => {
    try {
        const token = req.header('Authorization');
        const decoded = jwt.verify(token, 'your_secret_key');
        const sellerId = decoded.id;

        const products = await Product.find({ seller_id: sellerId });

        return res.status(200).json({ products });
    } catch (error) {
        console.log(error);
        return res.status(500).json({ message: 'Internal Server Error' });
    }
}
);

// view one product
router.get('/viewProduct', verifySellerToken, async (req, res) => {
    try {
        const { name } = req.body;

        const product = Product.findOne({ name: name });

        res.status(200).json({ product });

    } catch (error) {
        console.log(error);

    }
}
);

// update quantity
router.put('/updateQuantity', async (req, res) => {
    try {
        const { name, quantity } = req.body;

        const token = req.header('Authorization');
        const decoded = jwt.verify(token, 'your_secret_key');
        const sellerId = decoded.id;
        // Find the product by name
        const product = await Product.findOne({ name: name, seller_id: sellerId });

        if (!product) {
            return res.status(400).json({ message: 'Product not found' });
        }

        if (product) {
            console.log(product);
            product.qty = quantity;

            await product.save();
        }
        return res.status(201).json({ message: 'Quantity updated successfully' });

    } catch (error) {
        console.log(error);
        return res.status(500).json({ message: 'Internal Server Error' });
    }
}
);

// put discount
router.put('/updateDiscount', async (req, res) => {
    try {
        const { name, discount } = req.body;

        const token = req.header('Authorization');
        const decoded = jwt.verify(token, 'your_secret_key');
        const sellerId = decoded.id;


        // Find the product by name
        const product = await Product.findOne({ name: name, seller_id: sellerId });

        if (!product) {
            return res.status(400).json({ message: 'Product not found' });
        }
        if (product) {
            //find by name and update
            product.discount = discount;

            await product.save();
        }

        return res.status(201).json({ message: 'Discount updated successfully' });

    } catch (error) {
        console.log(error);
        return res.status(500).json({ message: 'Internal Server Error' });
    }
}
);

// -----------------------------ORDER--------------------------------------------

// view all orders
router.get('/viewAllOrders', verifySellerToken, async (req, res) => {
    try {
        const token = req.header('Authorization');
        const decoded = jwt.verify(token, 'your_secret_key');
        const sellerId = decoded.id;

        const orders = await Order.find({ seller_id: sellerId });

        res.status(200).json({ orders });
    } catch (error) {
        console.log(error);
    }
}
);

// view one order
router.get('/viewOrder', verifySellerToken, async (req, res) => {
    try {
        const { id } = req.body;

        const order = Order.findOne({ _id: id });

        res.status(200).json({ order });

    } catch (error) {
        console.log(error);

    }
}
);

// update order status
router.put('/updateOrderStatus', verifySellerToken, async (req, res) => {
    try {
        const { orderID, status } = req.body;

        const token = req.header('Authorization');
        const decoded = jwt.verify(token, 'your_secret_key');
        const sellerId = decoded.id;

        // Find the order by id
        const order = await Order.findOne({ _id: orderID, seller_id: sellerId });

        if (!order) {
            res.status(400).json({ message: 'Order not found' });
        }

        if (order) {
            order.status = status;

            await order.save();
        }

        res.status(201).json({ message: 'Order status updated successfully' });

    } catch (error) {
        console.log(error);
    }
}
);

// -----------------------------PAYMENT--------------------------------------------
// view all payments
router.get('/viewAllPayments', verifySellerToken, async (req, res) => {
    try {
        const token = req.header('Authorization');
        const decoded = jwt.verify(token, 'your_secret_key');
        const sellerId = decoded.id;

        const payments = await Payment.find({ seller_id: sellerId });

        res.status(200).json({ payments });
    } catch (error) {
        console.log(error);
    }
}
);

// -----------------------------PROFILE--------------------------------------------

// view profile
router.get('/viewProfile', verifySellerToken, async (req, res) => {
    try {
        const token = req.header('Authorization');
        const decoded = jwt.verify(token, 'your_secret_key');
        const sellerId = decoded.id;

        const seller = await Seller.findOne({ _id: sellerId });

        res.status(200).json({ seller });
    } catch (error) {
        console.log(error);
    }
}
);

// update profile
router.put('/updateProfile', verifySellerToken, async (req, res) => {
    try {
        const { name, email, password, dob, address, contact } = req.body;

        const token = req.header('Authorization');
        const decoded = jwt.verify(token, 'your_secret_key');
        const sellerId = decoded.id;

        const seller = await Seller.findOne({ _id: sellerId });

        if (seller) {
            seller.name = name;
            seller.email = email;
            seller.password = password;
            seller.dob = dob;
            seller.address = address;
            seller.contact = contact;

            await seller.save();
        }

        res.status(201).json({ message: 'Profile updated successfully' });
    } catch (error) {
        console.log(error);
    }
}
);

module.exports = router;