const Product = require("../models/productModel");
const ErrorHandler = require("../utils/errorHandler");
const catchAsyncErrors = require("../middleware/catchAsyncErrors");
const ApiFeatures = require("../utils/apiFeatures");
const cloudinary = require("cloudinary");


// Create Product -- Amin
const createProduct = catchAsyncErrors(async (req, res, next) => {

    let images = [];

  if (typeof req.body.images === "string") {
    images.push(req.body.images);
  } else {
    images = req.body.images;
  }

  const imagesLinks = [];

  for (let i = 0; i < images.length; i++) {
    const result = await cloudinary.v2.uploader.upload(images[i], {
      folder: "products",
    });

    imagesLinks.push({
      public_id: result.public_id,
      url: result.secure_url,
    });
  }

    req.body.images = imagesLinks;
    req.body.user = req.user.id;

    const product = await Product.create(req.body);

    res.status(200).json({
        success: true,
        product
    })
})


// get all products 
const getAllProducts = catchAsyncErrors(async (req, res) => {

    // const resultPerPage = 4;
    const productsCount = await Product.countDocuments();

    const apiFeature = new ApiFeatures(Product.find(), req.query)
        .search()
        .filter()

        

    //    .pagination(resultPerPage);
    const products = await apiFeature.query;
    res.status(200).json({
        success: true,
        products,
        productsCount,
        // filteredProductsCount
    })
})

// Update Product -- Admin
const updateProduct = catchAsyncErrors(async (req, res) => {
    let product = await Product.findById(req.params.id);

    if (!product) {
        return res.status(500).json({
            success: false,
            message: "Product not found"
        })
    }

    product = await Product.findByIdAndUpdate(req.params.id, req.body, {
        new: true,
        runValidators: true,
        useFindAndModify: false
    })

    res.status(200).json({
        success: true,
        product,
    })
}
)

// Delete a product

const deleteProduct = catchAsyncErrors(async (req, res, next) => {
    const product = await Product.findByIdAndDelete(req.params.id);

    if (!product) {
        return next(new ErrorHandler("product not found", 404));
    }
     
    // Deleteing images from cloudinary
    for(let i=0; i<product.images.length; i++){
         await cloudinary.v2.uploader.destroy(product.images[i].public_id)
    }

    res.status(200).json({
        success: true,
        message: "Product deleted successfully"
    })
})

// Get single product

const getSingleProduct = catchAsyncErrors(async (req, res, next) => {
    const product = await Product.findById(req.params.id);

    if (!product) {
        return next(new ErrorHandler("product not found", 404));
    }

    res.status(200).json({
        success: true,
        product
    })

})

// Create New Review or Update the review

const createProductReview = catchAsyncErrors(async (req, res, next) => {

    const { productId, rating, comment } = req.body;

    const review = {
        user: req.user._id,
        name: req.user.name,
        rating: Number(rating),
        comment,
        // productId:req.body.productId
    }

    const product = await Product.findById(productId);

    const isReviewed = product.reviews.find(
        (rev) => rev.user.toString() === req.user._id.toString()
    );

    if (isReviewed) {
        product.reviews.forEach(rev => {
            if (rev.user.toString() === req.user._id.toString()) {
                rev.rating = rating,
                    rev.comment = comment
            }
        })

    } else {
        product.reviews.push(review)
        product.numOfReviews = product.reviews.length;
    }

    let avg = 0;
    product.reviews.forEach((rev) => {
        avg += rev.rating;
    })

    product.ratings = avg / product.reviews.length;

    await product.save({ validateBeforeSave: false });

    res.status(200).json({
        success: true
    })

})


// get all reviews of single product
const getProductReviews = catchAsyncErrors(async (req, res, next) => {
    const product = await Product.findById(req.query.id);
    if (!product) {
        return next(new ErrorHandler("Product not found", 404));
    }

    res.status(200).json({
        success: true,
        reviews: product.reviews
    })
})

// delete reviews
const deleteReviews = catchAsyncErrors(async (req, res, next) => {
    const product = await Product.findById(req.query.productId);
    if (!product) {
        return next(new ErrorHandler("Product not found", 404));
    }

    const reviews = product.reviews.filter(rev => rev._id.toString() !== req.query.productId.toString())

    let avg = 0;
    reviews.forEach((rev) => {
        avg += rev.rating;
    })

    const ratings = avg / reviews.length;
    const numOfReviews = reviews.length;

    await Product.findByIdAndUpdate(req.query.productId, {
        reviews, ratings, numOfReviews
    }, {
        new: true,
        runValidators: true,
        useFindAndModify: false
    })


    res.status(200).json({
        success: true
    })

    res.status(200).json({
        success: true,
    })
})

// get all products -- ADMIN
const getAdminProducts = catchAsyncErrors(async (req, res) => {

    const products = await Product.find();

    res.status(200).json({
        success: true,
        products,

        // filteredProductsCount
    })
})


module.exports = { getAllProducts, createProduct, updateProduct, deleteProduct, getSingleProduct, createProductReview, getProductReviews, deleteReviews, getAdminProducts };