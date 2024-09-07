import { Router } from "express";
import { database, mercadoPago } from "..";
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

router.get("/checkout/mercadopago", async (req, res) => {
    const { checkoutId } = req.query;
    if (!checkoutId) {
        return res.status(400).json({ message: "Missing parameters" });
    }
    const checkoutInfo = await database.getCheckout(checkoutId);
    const itemInfo = await database.getProductFromStore(checkoutInfo.itemId);
    if (!checkoutInfo || !itemInfo) {
        return res.status(404).json({ message: "Checkout not found" });
    }
    mercadoPago.createPayment({
        id: itemInfo.itemId,
        title: itemInfo.itemName,
        price: itemInfo.price,
        userId: checkoutInfo.userId,
    }).then((url) => {
        res.redirect(url);
    });
});

router.get("/cancel", async (req, res) => {
    await database.deleteCheckout(req.query.id);
    res.redirect("https://foxybot.win/");
});

// TODO

module.exports = router;