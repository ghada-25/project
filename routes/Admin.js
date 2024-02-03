const express = require('express');
const adminRouter = express.Router();
const adminController = require('../controller/admin-controller.js');
const authMiddleware = require('../middleware/authMiddleware.js');



adminRouter.get('/unapproved-products', adminController.getUnapprovedProducts);
adminRouter.put('/approve-product/:productId', adminController.updateProductApprovalStatus);
adminRouter.post('/add-product', adminController.addProduct);
adminRouter.put('/confirm-order/:orderId', adminController.processOrder);
adminRouter.get('/unconfirmed-orders', adminController.getUnconfirmedOrders);
adminRouter.get('/all-customers', adminController.getAllCustomers);
adminRouter.put('/customer-block-status/:customerId',adminController.customerBlockStatus);
adminRouter.get('/all-sellers', adminController.getAllSellers);
adminRouter.get('/all-orders', adminController.getAllOrders);
adminRouter.get('/all-products', adminController.getAllProducts);
adminRouter.put('/seller-block-status/:sellerId', adminController.sellerBlockStatus);
adminRouter.post('/add-order', adminController.addOrder);
adminRouter.post('/add-category', adminController.addCategory);
adminRouter.get('/all-categories', adminController.getAllCategories);

//adminRouter.post('/add-customer', adminController.addCustomer);
adminRouter.post('/add-seller', adminController.addSeller);
adminRouter.put('/edit-profile/:adminId',adminController.updateAdminProfile);
adminRouter.post('/add-admin', adminController.addAdmin);
adminRouter.get('/profile/:adminId', adminController.getAdminProfile);
adminRouter.get('/product/:id', adminController.getProductByID);
module.exports = adminRouter;