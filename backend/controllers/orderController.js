const Order = require("../models/orderModel");
const Product = require('../models/productModel');
const ErrorHandler = require("../utils/errorHandler");
const catchAsyncErrors = require("../middleware/catchAsyncErrors");

// create new order
const newOrder = catchAsyncErrors(async(req,res,next) => {
    const {shippingInfo, orderItems, paymentInfo, itemPrice, taxPrice,shippingPrice, totalPrice} = req.body;

    const order = await Order.create({
        shippingInfo, 
        orderItems, 
        paymentInfo, 
        itemPrice, 
        taxPrice,
        shippingPrice, 
        totalPrice,
        paidAt:Date.now(),
        user:req.user._id,
    })

    res.status(201).json({
        success:true,
        order
    })
})

// get single Order
const getSingleOrder = catchAsyncErrors(async(req,res,next) => {
   const order = await Order.findById(req.params.id).populate("user", "name email");

   if(!order){
    return next(new ErrorHandler("order not found", 404))
   }

   res.status(200).json({
    success:true,
    order
   })
})

// get loggedin user order
const myOrders = catchAsyncErrors(async(req,res,next) => {
    const orders = await Order.find({user:req.user._id})
 
 
    res.status(200).json({
     success:true,
     orders
    })
 })

// get all orders---admin
const getAllOrders = catchAsyncErrors(async(req,res,next) => {
const orders = await Order.find();

if(!orders){
    return next(new ErrorHandler("no order found", 400));
}

let totalAmount = 0;

orders.forEach(order => {
    totalAmount+=order.totalPrice;
})

res.status(200).json({
    success:true,
    totalAmount,
    orders
})

})

// update order status -- admin
const updateOrder = catchAsyncErrors(async(req,res,next) => {
  const order = await Order.findById(req.params.id);

  if(order.orderStatus === "Delivered"){
    return next(new ErrorHandler("You have already delivered this order", 404))
  }

  order.orderItems.forEach(async(o) => {
    await updateStock(o.product, o.quantity);
  })

  order.orderStatus = req.body.status;

  if(req.body.status === "Deliverd"){
      order.deliveredAt = Date.now()
  }

  await order.save({validateBeforeSave:false})

  res.status(200).json({
    success:true
  })

})

async function updateStock(id,quantity){
   const product = await Product.findById(id);
   product.stock -= quantity;
    await product.save({validateBeforeSave:false})
}

// delete order -- admin
const delteOrder = catchAsyncErrors(async(req,res,next) => {
    const order = await Order.findByIdAndDelete(req.params.id);

    if(!order){
        return next(new ErrorHandler("no order request from this is",404))
    }
  
    res.status(200).json({
        success:true,
        message:"Order removed successfully"
    })
  
  })

module.exports = {newOrder, getSingleOrder, myOrders, getAllOrders,updateOrder, delteOrder}