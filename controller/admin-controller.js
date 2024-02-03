const Product = require('../models/Product.js');
const Order = require('../models/Order.js');
const Customer = require('../models/Customer.js');
const Seller = require('../models/Seller.js');
const Admin = require('../models/Admin.js')
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const Category = require('../models/Categories.js')
require('dotenv').config();
const secret = process.env.JWT_SECRET;
const getUnapprovedProducts = async (req, res) => {
  try {
    const unapprovedProducts = await Product.find({ approval: false });

    res.status(200).json(unapprovedProducts);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
};
const adminLogin = async (req, res) => {
  try {
    console.log(process.env.JWT_SECRET);
    const { email, password } = req.body;

    const existingAdmin = await Admin.findOne({ email });

    if (!existingAdmin) {
      return res.status(404).json({ message: 'Admin not found' });
    }

    const isPasswordCorrect = await bcrypt.compare(password, existingAdmin.password);

    if (!isPasswordCorrect) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    const token = jwt.sign({ email: existingAdmin.email, id: existingAdmin._id }, secret, { expiresIn: '1h' });

    res.status(200).json({ result: existingAdmin, token, });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: error.message || 'Internal Server Error' });
  }
};
const updateProductApprovalStatus = async (req, res) => {
  const productId = req.params.productId;
  const { approval } = req.body;

  try {
    const product = await Product.findById(productId);

    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    product.approval = approval;
    console.log('Updating product approval status:', productId, approval);
    await product.save();

    res.status(200).json({ message: `Product approval status updated to ${approval}` });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
};

const addProduct = async (req, res) => {
  try {
    const newProduct = new Product(req.body);
    const savedProduct = await newProduct.save();
    res.status(201).json(savedProduct);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
};

const processOrder = async (req, res) => {
  const orderId = req.params.orderId;
  const { orderStatus } = req.body;
  console.log(orderId, orderStatus);
  try {
    const order = await Order.findById(orderId);
    console.log(order);
    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    order.status = orderStatus;
    console.log('Updating order status:', orderId, orderStatus);

    await order.save();

    console.log('Order status updated successfully');
    return res.status(200).json({ message: `Order status updated to ${orderStatus}` });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: 'Internal Server Error' });
  }
};

const getUnconfirmedOrders = async (req, res) => {
  try {
    const unconfirmedOrders = await Order.find({});

    res.status(200).json(unconfirmedOrders);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
};

const getAllCustomers = async (req, res) => {
  try {
    const customers = await Customer.find();
    res.status(200).json(customers);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
};

const customerBlockStatus = async (req, res) => {
  const customerId = req.params.customerId;
  const { block } = req.body;

  try {
    const customer = await Customer.findById(customerId);

    if (!customer) {
      return res.status(404).json({ message: 'Customer not found' });
    }

    customer.block = block;
    await customer.save();

    res.status(200).json({ message: `Customer block status updated to ${block}` });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
};

const addOrder = async (req, res) => {
  try {

    const { customer, products, sizes, price, feedback, rating, orderStatus, orderDate } = req.body;

    // Create a new order
    const newOrder = new Order({
      customer,
      products,
      sizes,
      price,
      feedback,
      rating,
      orderStatus,
      orderDate,
    });

    // Save the order to the database
    const savedOrder = await newOrder.save();

    res.status(201).json(savedOrder);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
};
const addCustomer = async (req, res) => {
  try {
    const { name, password, email, dob, addresses, paymentMethods, block, favourites } = req.body;

    const newCustomer = new Customer({
      name,
      password,
      email,
      dob,
      addresses,
      paymentMethods,
      block,
      favourites
    });

    // Save the customer to the database
    const savedCustomer = await newCustomer.save();

    res.status(201).json(savedCustomer);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
};
const addSeller = async (req, res) => {
  try {
    const { name, password, email, dob, block } = req.body;

    const newSeller = new Seller({
      name,
      password,
      email,
      dob,
      block

    });

    const savedSeller = await newSeller.save();

    res.status(201).json(savedSeller);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
};
const getAllSellers = async (req, res) => {
  try {
    const sellers = await Seller.find();
    res.status(200).json(sellers);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
};

const sellerBlockStatus = async (req, res) => {
  const sellerId = req.params.sellerId;
  const { block } = req.body;

  try {
    const seller = await Seller.findById(sellerId);

    if (!seller) {
      return res.status(404).json({ message: 'Seller not found' });
    }

    seller.block = block;
    await seller.save();

    res.status(200).json({ message: `Seller block status updated to ${block}` });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
};
const updateAdminProfile = async (req, res) => {
  const adminId = req.params.adminId;

  try {
    const admin = await Admin.findById(adminId);

    if (!admin) {
      return res.status(404).json({ message: 'Admin not found' });
    }

    admin.name = req.body.name || admin.name;
    admin.email = req.body.email || admin.email;
    admin.password = req.body.password || admin.password;
    admin.dob = req.body.dob || admin.dob;

    const updatedAdmin = await admin.save();

    res.status(200).json(updatedAdmin);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
};
const addAdmin = async (req, res) => {
  try {
    const { name, email, password, dob } = req.body;

    const hashedPassword = await bcrypt.hash(password, 10);

    const newAdmin = new Admin({
      name,
      email,
      password: hashedPassword,
      dob,
    });

    const savedAdmin = await newAdmin.save();

    res.status(201).json(savedAdmin);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
};
const getAdminProfile = async (req, res) => {
  try {
    const adminId = req.params.adminId;
    const admin = await Admin.findById(adminId);

    if (!admin) {
      return res.status(404).json({ message: 'Admin not found' });
    }

    res.status(200).json(admin);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
};
//extra stub endpoints
const getAllOrders = async (req, res) => {
  try {
    const orders = await Order.find();
    res.status(200).json(orders);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
}
const getProductByID = async (req, res) => {
  let productId = req.params.id;
  let product = await Product.findOne({ _id: productId });
  if (!product) {
    return res.status(404).send("The product with the given ID was not found.");
  }
  res.status(200).json(product);

}
const getAllProducts = async (req, res) => {
  try {
    const products = await Product.find();
    res.status(200).json(products);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Internal Server Error' });
  }


}

const addCategory = async (req, res) => {
  try {
    const { name } = req.body;
    const category = new Category({
      name
    });
    const savedCategory = await category.save();
    res.status(201).json(savedCategory);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Server error' });
  }
}


const getAllCategories = async (req, res) => {
  try {
    const categories = await Category.find();
    res.status(200).json(categories);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Server error' });
  }
}

module.exports = {
  getUnapprovedProducts,
  updateProductApprovalStatus,
  addProduct,
  processOrder,
  getUnconfirmedOrders,
  getAllCustomers,
  customerBlockStatus,
  addOrder,
  addCustomer,
  getAllSellers,
  sellerBlockStatus,
  addSeller,
  updateAdminProfile,
  adminLogin,
  addAdmin,
  getAdminProfile,
  getAllOrders,
  getProductByID,
  getAllProducts,
  addCategory,
  getAllCategories,
};
