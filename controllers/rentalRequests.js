const Listing = require("../models/listing");
const User = require("../models/user");
const RentalRequest = require("../models/rentalRequest");

// Fetch rental requests for a user
module.exports.getCart = async (req, res) => {
  try {
    const userId = req.params.userId || req.userId;
    const requests = await RentalRequest.find({ user_id: userId })
      .populate("listing_id", "title description price image")
      .exec();
    res.render("cart/showCart.ejs", { requests, userId });
  } catch (error) {
    res.status(500).send("Error fetching rental requests.");
  }
};

// Delete a rental request
module.exports.deleteRentalRequest = async (req, res) => {
  try {
    const { id, userId } = req.params;
    await RentalRequest.findByIdAndDelete(id);
    console.log(`Rental request with ID ${id} deleted.`);
    res.redirect(`/rent/${userId}`);
  } catch (error) {
    console.error("Error deleting rental request:", error);
    res.status(500).send("Error deleting rental request.");
  }
};

// Checkout a listing
module.exports.checkoutListing = async (req, res) => {
  try {
    const { userId, listingId } = req.params;
    const listing = await Listing.findById(listingId);
    if (!listing) return res.status(404).send("Listing not found.");

    const user = await User.findById(userId);
    if (!user) return res.status(404).send("User not found.");
    
    res.render("cart/checkout.ejs", { listing, user });
  } catch (error) {
    console.error("Error fetching listing or user:", error);
    res.status(500).send("Error fetching listing or user.");
  }
};
