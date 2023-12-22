const ErrorHandler = require("../utils/errorHandler");
const catchAsyncErrors = require("../middleware/catchAsyncErrors");

const stripe = require("stripe")("sk_test_51NjD9BSAwjgzRHfsGC3hgmQAPBRIhNskq9HIGq9erMQxakx1NtixbKQzcEMRXAj9sfDp0omzZxXc75Pzb9nJbLkn00iOQFfRcY")

const processPayment = catchAsyncErrors(async (req, res, next) => {
  const myPayment = await stripe.paymentIntents.create({
    amount: req.body.amount,
    currency: "inr",
    metadata: {
      company: "Ecommerce",
    },
  });

  res
    .status(200)
    .json({ success: true, client_secret: myPayment.client_secret });
});


const sendStripeApiKey = catchAsyncErrors(async(req,res,next) => {
    res.status(200).json({ stripeApiKey: "pk_test_51NjD9BSAwjgzRHfsve8nj5JK5m10kUTkNUElkVCZeF5t24Umby4GwgIO7VGdStTUq7FfNq6Ig57QdnyhXtfykhcN00ivsMtFwY" });

    console.log("Hello world")

})


module.exports = {processPayment, sendStripeApiKey}

