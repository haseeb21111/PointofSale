import Seller from "../models/sellerModel.js";

export const addSellerController = async (req, res) => {
  try {
    const newSeller = new Seller(req.body);
    await newSeller.save();
    res.status(200).json(newSeller); // Return the saved seller to get the ID
  } catch (error) {
    console.error("Error saving seller information:", error);
    res.status(500).json({ message: "Error saving seller information", error });
  }
};

export const getSellersController = async (req, res) => {
  try {
    const sellers = await Seller.find(); // Fetch all sellers
    res.status(200).json(sellers);
  } catch (error) {
    console.error("Error fetching sellers:", error);
    res.status(500).json({ message: "Error fetching sellers", error });
  }
};


// New function to get a seller by their ID
export const getSellerByIdController = async (req, res) => {
  try {
    const seller = await Seller.findById(req.params.id);
    if (seller) {
      res.status(200).json(seller);
    } else {
      res.status(404).json({ message: "Seller not found" });
    }
  } catch (error) {
    console.error("Error fetching seller by ID:", error);
    res.status(500).json({ message: "Error fetching seller", error });
  }
};
export const updateSellerController = async (req, res) => {
  try {
    const { id } = req.params;
    const updatedSeller = await Seller.findByIdAndUpdate(id, req.body, { new: true });
    res.status(200).json(updatedSeller);
  } catch (error) {
    console.error("Error updating seller information:", error);
    res.status(500).json({ message: "Error updating seller information", error });
  }
};
