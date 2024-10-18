import { Router } from "express";
import { database, mercadoPago } from "..";
import OrderHandler from "../services/foxy/OrderHandler";
import { MercadoPagoOrder } from "../utils/types/order";
import { MercadoPagoEvents } from "../utils/types/mercadopago";
import { logger } from "../utils/logger";

const router = Router();
const orderHandler = new OrderHandler();

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
        title: itemInfo.itemName + ` - ${checkoutInfo.userId}`,
        price: 1,
        userId: checkoutInfo.userId,
    }).then((url) => {
        res.redirect(url);
    });
});

router.post("/mercadopago/webhook", async (req, res) => {
    const body = req.body as MercadoPagoOrder;
    
    switch (body.action) {
        case MercadoPagoEvents.MERCADOPAGO_PAYMENT_UPDATED: {
            try {
                const payment = await mercadoPago.getPayment(body.data.id);
                if (payment.status === "approved") {
                    orderHandler.createOrder(body);
                }
                break;
            } catch (err) {
                logger.error(err);
                return res.status(500).send("Internal server error");
            }
        }
    }
});

router.get("/cancel", async (req, res) => {
    await database.deleteCheckout(req.query.id);
    res.redirect("https://foxybot.win/");
});

// TODO

module.exports = router;