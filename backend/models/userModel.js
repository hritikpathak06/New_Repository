const mongoose = require("mongoose");
const validator = require("validator");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const crypto = require("crypto");

const userSchema = new mongoose.Schema({
    name: {
        type: String,
        // required: [true, "Please Enter Your Name"],
        maxLength: [30, "name cannot exceed 30 charcaters"],
        minLength: [4, "Name should have more than 4 charcters"]
    },

    email: {
        type: String,
        required: [true, "Enter Your Email"],
        unique: true,
        validate: [validator.isEmail, "Please Enter a valid Email"]
    },

    password: {
        type: String,
        required: [true, "Enter Your Pasword"],
        minLength: [8, "Password should have more than 8 charcters"],
        select: false
    },

    avatar: {
        public_id: {
            type: String,
            required: true
        },
        url: {
            type: String,
            required: true
        }
    },

    role:{
        type:String,
        default: "User"
    },

    resetPasswordToken:String,
    resetPasswordExpire:Date,

})

userSchema.pre("save", async function(next){
    if(!this.isModified("password")){
        next();
    }
    this.password = await bcrypt.hash(this.password, 10);
})

// JWT Token
userSchema.methods.getJWTToken = function(){
 return jwt.sign({id:this._id},"MYNAMEISRITIKKUMARPATHAKSTUDENTOFPATELCOLLGEANDSCIENCETECHNOLOGY", {
    expiresIn:"5d",
 });
}

// Compare Password
userSchema.methods.comparePassword = async function(enterdPassword){
   return await bcrypt.compare(enterdPassword, this.password)
}

// Generating Password reset toke

userSchema.methods.getResetPasswordToken = function(){
//    Generating Token
const resetToken = crypto.randomBytes(20).toString("hex");

// Hashing and adding to userSchema
this.resetPasswordToken = crypto
.createHash("sha256")
.update(resetToken)
.digest("hex");

this.resetPasswordExpire = Date.now() + 15*60*1000;
 
return resetToken;
}



module.exports = mongoose.model("User", userSchema);