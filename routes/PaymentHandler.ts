import { Router } from "express";
import { database } from "..";
const router = Router();

router.get('/checkout/id/:checkoutId', async (req, res) => {
    const { checkoutId } = req.params;

    try {
        const checkoutInfo = await database.getCheckout(checkoutId);
        if (!checkoutInfo) {
            return res.status(404).json({ message: "Checkout not found" });
        }
        const itemInfo = await database.getProductFromStore(checkoutInfo.itemId);

        if (!itemInfo) {
            return res.status(404).json({ message: "Item not found" });
        }
        res.render("../public/pages/checkout.ejs", {
            item: {
                checkoutId: checkoutInfo.checkoutId,
                id: checkoutInfo.itemId,
                name: itemInfo.itemName,
                price: itemInfo.price,
                description: "Premium",
            },
            userId: checkoutInfo.userId,
        });
    } catch (error) {
        console.log("Error: ", error);
    }

});

router.get("/cancel", async (req, res) => {
    await database.deleteCheckout(req.query.id);
    res.redirect("https://foxybot.win/");
});

// TODO

module.exports = router;