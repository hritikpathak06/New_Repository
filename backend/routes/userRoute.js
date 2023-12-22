const express = require("express");
const router = express.Router();
const { registerUser, loginUser, logoutUser, forgotPassword, getUserDetails, updatePassword, updateProfile, getAllUsers, getSingleUser, updateUserRole, deleteUser } = require("../controllers/userController");
const { isAuthenticatedUser, authorizeRoles } = require("../middleware/auth");

router.route('/register').post(registerUser);

router.route('/password/forgot').post(forgotPassword);

router.route('/login').post(loginUser);

router.route('/logout').get(logoutUser);

router.route('/me').get(isAuthenticatedUser,getUserDetails);

router.route("/password/update").put(isAuthenticatedUser,updatePassword);

router.route('/me/update').put(isAuthenticatedUser,updateProfile);

router.route('/admin/users').get(isAuthenticatedUser, authorizeRoles("admin"),getAllUsers)

router.route("/admin/user/:id").get(isAuthenticatedUser,authorizeRoles("admin"), getSingleUser).put(isAuthenticatedUser,authorizeRoles("admin"), updateUserRole)
.delete(isAuthenticatedUser,authorizeRoles("admin"), deleteUser);


module.exports = router;