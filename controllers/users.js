const User = require("../models/user");

module.exports.renderSignupForm = (req, res) => {
  res.render("users/signup.ejs");
};

module.exports.signup = async (req, res) => {
  try {
    let { username, email, password } = req.body;
    const newUser = new User({ email, username });
    const registeredUser = await User.register(newUser, password);
    console.log(registeredUser);
    req.login(registeredUser, (err) => {
      if (err) {
        return next(err);
      }
      req.flash("success", "Welcome to Wanderlust!");
      res.redirect("/listings");
    });
  } catch (e) {
    req.flash("error", e.message);
    res.redirect("/signup");
  }
};

module.exports.renderLoginForm = (req, res) => {
  res.render("users/login.ejs");
};

// module.exports.login = async (req, res) => {
//   req.flash("success", "Welcome back to Wanderlust!");
//   let redirectUrl = res.locals.redirectUrl || "/listings";
//   res.redirect(redirectUrl);
// };

// with authentication of otp  


const crypto = require("crypto"); // For generating OTP
const nodemailer = require("nodemailer"); // For sending OTP emails

module.exports.login = async (req, res) => {
  try {
    // Generate a random 6-digit OTP
    const otp = crypto.randomInt(100000, 999999).toString();
    const otpExpiry = Date.now() + 5 * 60 * 1000; // OTP valid for 5 minutes

    // Save OTP and expiry in the user's document
    req.user.otp = otp;
    req.user.otpExpiry = otpExpiry;
    await req.user.save();

    // Send OTP to the user's email
    const transporter = nodemailer.createTransport({
      service: "Gmail",
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });

    await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to: req.user.email,
      subject: "Your OTP for Login",
      text: `Your OTP is: ${otp}. It will expire in 5 minutes.`,
    });

    req.flash("success", "OTP sent to your email. Please check your inbox.");
    res.redirect("/verify-otp"); // Redirect to OTP verification page
  } catch (e) {
    req.flash("error", "An error occurred while sending the OTP.");
    res.redirect("/login");
  }
};

// OTP verification logic
module.exports.verifyOtp = async (req, res) => {
  const { otp } = req.body;

  // Find the user in session
  const user = req.user;

  if (!user || user.otp !== otp || user.otpExpiry < Date.now()) {
    req.flash("error", "Invalid or expired OTP. Please try again.");
    return res.redirect("/login");
  }

  // Clear OTP and expiry after successful verification
  user.otp = null;
  user.otpExpiry = null;
  await user.save();

  req.flash("success", "Login successful!");
  let redirectUrl = res.locals.redirectUrl || "/listings";
  res.redirect(redirectUrl);
};

module.exports.logout = (req, res, next) => {
  req.logout((err) => {
    if (err) {
      return next(err);
    }
    req.flash("success", "you are logged out!");
    res.redirect("/listings");
  });
};
