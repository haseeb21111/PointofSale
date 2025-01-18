import Bills from "../models/billsModel.js";
import Earnings from "../models/earningsModel.js";
import Products from "../models/productModel.js";

// Controller to get all bills
export const getBillsController = async (req, res) => {
    try {
        const bills = await Bills.find(); // Fetch all bills

        // Check if grouped data is requested
        if (req.query.grouped === "true") {
            // Group bills by customerName and customerCNIC
            const groupedBills = bills.reduce((acc, bill) => {
                const key = `${bill.customerName}_${bill.customerCNIC}`;
                if (!acc[key]) {
                    acc[key] = {
                        customerName: bill.customerName,
                        customerCNIC: bill.customerCNIC,
                        customerPhone: bill.customerPhone,
                        customerAddress: bill.customerAddress,
                        bills: [],
                    };
                }
                acc[key].bills.push(bill); // Add bill to the customer's group
                return acc;
            }, {});

            return res.status(200).json(Object.values(groupedBills)); // Return grouped bills as an array
        }

        // Default: Return all ungrouped bills
        res.status(200).json(bills);
    } catch (error) {
        console.error("Error fetching bills:", error);
        res.status(500).send("Error fetching bills");
    }
};



// Controller to add a new bill
export const addBillsController = async (req, res) => {
    try {
        const { cartItems, ...rest } = req.body;

        // Fetch buying price for each product dynamically
        const enrichedCartItems = await Promise.all(
            cartItems.map(async (item) => {
                const product = await Products.findById(item._id); // Fetch product by its ID
                return { ...item, buyingPrice: product?.buyingPrice || 0 }; // Attach buying price
            })
        );

        const newBills = new Bills({
            ...rest,
            cartItems: enrichedCartItems, // Include updated cartItems with buyingPrice
        });

        await newBills.save();

        // Calculate total buying price and profit
        const totalBuyingPrice = enrichedCartItems.reduce(
            (acc, item) => acc + item.buyingPrice * item.quantity,
            0
        );
        const totalProfit = rest.paidAmount > totalBuyingPrice
            ? rest.paidAmount - totalBuyingPrice
            : 0;

        // Update earnings record
        let earningsRecord = await Earnings.findOne();
        if (!earningsRecord) {
            earningsRecord = new Earnings();
        }
        earningsRecord.totalEarnings += rest.paidAmount;
        earningsRecord.totalProfit += totalProfit;

        await earningsRecord.save();

        res.send("Bill Created Successfully!");
    } catch (error) {
        console.error("Error creating bill:", error);
        res.status(500).send("Error creating bill");
    }
};

// Controller to update a bill
export const updateBillController = async (req, res) => {
    try {
        const { _id, paidAmount, cartItems, ...updatedData } = req.body;

        // Fetch the old bill
        const oldBill = await Bills.findById(_id);
        if (!oldBill) {
            return res.status(404).send("Bill not found");
        }

        // Merge Old and New Products (Prevent Duplicate Entries)
        const existingItemsMap = new Map(
            oldBill.cartItems.map((item) => [item._id.toString(), item])
        );

        const mergedCartItems = cartItems.map((item) => {
            if (existingItemsMap.has(item._id.toString())) {
                const existingItem = existingItemsMap.get(item._id.toString());
                existingItem.quantity += item.quantity;  // Increase quantity if product already exists
                return existingItem;
            }
            return item;  // Add new product if not found in existing bill
        });

        // Append remaining old products that were not updated
        oldBill.cartItems.forEach((item) => {
            if (!existingItemsMap.has(item._id.toString())) {
                mergedCartItems.push(item);
            }
        });

        // Fetch buying price for each product dynamically
        const enrichedCartItems = await Promise.all(
            mergedCartItems.map(async (item) => {
                const product = await Products.findById(item._id);
                return { ...item, buyingPrice: product?.buyingPrice || 0 };
            })
        );

        // Calculate total buying price and profit
        const totalBuyingPrice = enrichedCartItems.reduce(
            (acc, item) => acc + item.buyingPrice * item.quantity,
            0
        );

        const newProfit = paidAmount > totalBuyingPrice
            ? paidAmount - totalBuyingPrice
            : 0;

        const oldProfit = oldBill.paidAmount > totalBuyingPrice
            ? oldBill.paidAmount - totalBuyingPrice
            : 0;

        // Update earnings
        const earningsRecord = await Earnings.findOne();
        if (earningsRecord) {
            earningsRecord.totalEarnings += paidAmount - oldBill.paidAmount;
            earningsRecord.totalProfit += newProfit - oldProfit;

            await earningsRecord.save();
        }

        // Update the bill with merged cart items
        const updatedBill = await Bills.findByIdAndUpdate(
            _id,
            {
                ...updatedData,
                cartItems: enrichedCartItems,
                paidAmount,
                remainingAmount: updatedData.totalAmount - paidAmount,
            },
            { new: true }
        );

        res.status(200).send(updatedBill);
    } catch (error) {
        console.error("Error updating bill:", error);
        res.status(500).send("Error updating bill");
    }
};



export const getProductsByCustomerId = async (req, res) => {
    try {
        const { customerId } = req.params;
        const bill = await Bills.findOne({ _id: customerId });

        if (bill) {
            res.json(bill.cartItems);
        } else {
            res.status(404).send("No products found for this customer");
        }
    } catch (error) {
        console.error("Error fetching products for customer:", error);
        res.status(500).send("Server Error");
    }
};


export const getBillByIdController = async (req, res) => {
    try {
        const bill = await Bills.findById(req.params.id);
        if (!bill) {
            return res.status(404).send("Bill not found");
        }
        res.json(bill);
    } catch (error) {
        console.error("Error fetching bill:", error);
        res.status(500).send("Error fetching bill");
    }
};
