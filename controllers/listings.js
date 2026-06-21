const { listingSchema } = require("../schema.js");
const ExpressError = require("../util/ExpressError.js");
const Listing = require("../models/listing");

module.exports.index = async(req, res, next) => {
    const allListings = await Listing.find({});
    res.render("listings/index", {allListings});
    };

module.exports.renderNewForm = (req, res) =>{
    res.render("listings/new");
};    

module.exports.showListing = async (req, res, next) => {
    let { id } = req.params;
    const listing = await Listing.findById(id)
    .populate({path: "reviews",
        populate:{
            path: "author",
        },
    })
    .populate("owner");
    if(!listing){
        req.flash("error", "Listing you requested for does not exist!");
        return res.redirect("/listings");
    }
    console.log(listing);
    return res.render("listings/show.ejs", { listing });
};

module.exports.createListing = async (req, res, next) => {
   let url = req.file.path;
   let filename = req.file.filename;

   let result = listingSchema.validate(req.body);
   console.log(result);
   if(result.error){
    throw new ExpressError(400, result.error);
   }
   const data = req.body.listing;

 const newListing = new Listing({
        title: data.title,
        description: data.description,
        price: data.price,
        location: data.location,
        country: data.country,
        image: {
  url: data.image?.trim() || "https://picsum.photos/300",
  filename: "listingimage"
}
    });
    newListing.owner = req.user._id;
    newListing.image = {url, filename};
    await newListing.save();
    req.flash("success", "New Listing created!")
    res.redirect("/listings");

};

module.exports.editListing = async(req, res) => {
    let { id } = req.params;
    const listing = await Listing.findById(id);
    if(!listing){
        req.flash("error", "Listing you requested for does not exist!");
        return res.redirect("/listings");
    }

    let originalImageUrl = listing.image.url;
    originalImageUrl = originalImageUrl.replace("/upload", "/upload/w_250");
    res.render("listings/edit", { listing, originalImageUrl });
};

module.exports.updateListing = async (req, res) => {
        let { id } = req.params;

        let updateData = req.body.listing;

        // ✅ Fix image structure if it's coming as string
        if (typeof updateData.image === "string") {
            if (updateData.image.trim() === "") {
                delete updateData.image; // keep old image
            } else {
                updateData.image = {
                    url: updateData.image,
                    filename: "listingimage"
                };
            }
        }

        let listing = await Listing.findByIdAndUpdate(id, updateData);

        if(typeof req.file !== "undefined"){
        let url = req.file.path;
        let filename = req.file.filename;
        listing.image = { url, filename};
        await listing.save();
        }

        req.flash("success", "Listing Updated!");
        res.redirect(`/listings/${id}`);
};

module.exports.destroyListing = async (req, res, next) => {
    let { id } = req.params;
    let deleteListing = await Listing.findByIdAndDelete(id);
    console.log(deleteListing);
    req.flash("success", "Listing Deleted!")
    res.redirect("/listings");
};