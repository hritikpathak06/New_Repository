const ErrorHandler = require("../utils/errorHandler");
const catchAsyncErrors = require("../middleware/catchAsyncErrors");
const User = require('../models/userModel');
const sendToken = require("../utils/jwtToken");
const sendEmail = require("../utils/sendEmail");
const cloudinary = require('cloudinary');
// const sendEmail = require('../utils/sendEmail')

// Register a user--

const registerUser = catchAsyncErrors(async (req,res,next) => {
   
    const myCloud = await cloudinary.v2.uploader.upload(req.body.avatar, {
        folder: "avatars",
        width:150,
        crop:"scale"
    })

    const {name,email,password} = req.body;
    const user = await User.create({
        name,
        email,
        password,
        avatar:{
            public_id:myCloud.public_id,
            url:myCloud.secure_url
        }

    });
    sendToken(user,201,res);
});



// Login user

const loginUser = catchAsyncErrors(async (req,res,next) => {
    const{email,password} = req.body;
    
    // Checking if user has given password and email both|||

    if(!email || !password){
        return next(new ErrorHandler("Please enter email and password", 400));
    }

    const user = await User.findOne({email:email}).select("+password");

    if(!user){
        return next(new ErrorHandler("Invalid email or password", 401))
    }

    const isPasswordMatch = await user.comparePassword(password);

    if(!isPasswordMatch){
        return next(new ErrorHandler("Invalid email or password", 401))
    }
    
    sendToken(user,200,res);
})


// Logout User

const logoutUser = catchAsyncErrors(async (req,res,next) => {
    
    res.cookie("token", null, {
        expires:new Date(Date.now()),
        httpOnly:true
    });

    res.status(200).json({
        success:true,
        message: "User logged out successfully"
    })
})

// Forgot password
const forgotPassword = catchAsyncErrors(async(req,res,next) => {
   const user = await User.findOne({email:req.body.email});
   
   if(!user){
    return next(new ErrorHandler("User not found", 404));
   }
//   get reset password token
const resetToken = user.getResetPasswordToken();

await user.save({validateBeforeSave:false});

const resetPasswordUrl = `${req.protocol}://${req.get(
    "host"
)}
/api/v1/password/reset/${resetToken}`

const message = `Your password reset token is: \n\n ${resetPasswordUrl}\n\n If you have not requested this email tehn please ignore it`;

try {
    
    await sendEmail({
       email:user.email,
       subject: "Eccomerce Password recovery",
       message
    });

    res.status(200).json({
        success:true,
        message:`Email sent to ${user.email} successfully`
    })

} catch (error) {
    user.resetPasswordToken = undefined;
    user.resetPasswordExpire = undefined;
    await user.save({validateBeforeSave:false});

    return next(new ErrorHandler(error.message, 500));
}

})

// Get user details

const getUserDetails = catchAsyncErrors(async(req,res,next) => {
const user = await User.findById(req.user.id);
    res.status(200).json({
        success:true,
        user
    })
})

// Update Password Route

const updatePassword = catchAsyncErrors(async(req,res,next) => {
  const user = await User.findById(req.user.id).select("+password");

  const isPasswordMatch = await user.comparePassword(req.body.oldPassword);

    if(!isPasswordMatch){
        return next(new ErrorHandler("oldpassword is incorrect", 400))
    }

    if(req.body.newPassword != req.body.confirmPassword){
        return next(new ErrorHandler("password does not match", 400))
    }

    user.password = req.body.newPassword;

    await user.save();

    sendToken(user,200,res)
})

// Update Profile
const updateProfile = catchAsyncErrors(async(req,res,next) => {
    const newUserData = {
        name:req.body.name,
        email:req.body.email
    }
    // we will add cloudnary later

    const user = await User.findByIdAndUpdate(req.user.id, newUserData, {
        new:true,
        runValidators:true,
        useFindAndModify:false
    })

    res.status(200).json({
        success:true,
        user
    })
})

// Get all users--(admin)

const getAllUsers = catchAsyncErrors(async(req,res,next) => {
    const users = await User.find();
    res.status(200).json({
        success:true,
        users
    })
})

// Detail of single user--(admin)

const getSingleUser = catchAsyncErrors(async(req,res,next) => {
    const user = await User.findById(req.params.id);

    if(!user){
        return next(new ErrorHandler("user not found", ))
    }

    res.status(200).json({
        success:true,
        user
    })
})

// Update user Role -- admin
const updateUserRole = catchAsyncErrors(async(req,res,next) => {
   const newUserData = {
    name:req.body.name,
    email:req.body.email,
    role:req.body.role
   }
   const user = await User.findByIdAndUpdate(req.params.id, newUserData, {
    new:true,
    runValidators:true,
    useFindAndModify:false
})

res.status(200).json({
    success:true,
    user
})
})

// Delete users--Admin

const deleteUser = catchAsyncErrors(async(req,res,next) => {
  
    // we will remove cloudinary

    const user = await User.findByIdAndDelete(req.params.id);

    if(!user){
        next(new ErrorHandler("user does not exists", 400));
    }

    res.status(200).json({
        success:true,
        message:"user deleted successfully"
    })
})



module.exports = {registerUser, loginUser, logoutUser,forgotPassword,getUserDetails,updatePassword,updateProfile,getAllUsers, getSingleUser, updateUserRole,deleteUser};