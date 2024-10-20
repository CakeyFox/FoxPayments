import { Router } from "express";
import { database, mercadoPago } from "..";
import OrderHandler from "../services/foxy/OrderHandler";
import { MercadoPagoOrder } from "../utils/types/order";
import { MercadoPagoEvents, MercadoPagoStatus } from "../utils/types/mercadopago";
import { logger } from "../utils/logger";

const router = Router();
const orderHandler = new OrderHandler();

router.get('/checkout/id/:checkoutId', async (req, res) => {
    const { checkoutId } = req.params;

    try {
        const checkoutInfo = await database.getCheckout(checkoutId);
        if (!checkoutInfo) return res.status(404).json({ message: "Checkout not found" });

        const itemInfo = await database.getProductFromStore(checkoutInfo.itemId);
        if (!itemInfo) return res.status(404).json({ message: "Item not found" });

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
        logger.error("Error fetching checkout:", error);
        res.status(500).json({ message: "Internal server error" });
    }
});

router.get("/checkout/mercadopago", async (req, res) => {
    const { checkoutId } = req.query;
    if (!checkoutId) return res.status(400).json({ message: "Missing parameters" });

    try {
        const checkoutInfo = await database.getCheckout(checkoutId);
        const itemInfo = await database.getProductFromStore(checkoutInfo.itemId);

        if (!checkoutInfo || !itemInfo) return res.status(404).json({ message: "Checkout not found" });

        const paymentUrl = await mercadoPago.createPayment({
            id: itemInfo.itemId,
            title: `${itemInfo.itemName} - ${checkoutInfo.userId}`,
            price: 1,
            userId: checkoutInfo.userId,
        });

        res.redirect(paymentUrl);
    } catch (error) {
        logger.error("Error creating payment:", error);
        res.status(500).json({ message: "Internal server error" });
    }
});

router.post("/mercadopago/webhook", async (req, res) => {
    const body = req.body as MercadoPagoOrder;

    try {
        if (body.action === MercadoPagoEvents.PAYMENT_UPDATED) {
            const paymentId = body.data.id;
            const payment = await mercadoPago.getPayment(paymentId);

            const itemInfo = await database.getProductFromStore(payment.additional_info.items[0].id);
            const checkoutInfo = await database.getCheckoutByUserId(payment.external_reference);

            logger.info(`Payment update: ${payment.id} - Status: ${payment.status}`);

            if (payment.status === MercadoPagoStatus.PAYMENT_APPROVED) {
                checkoutInfo.paymentId = payment.id;
                checkoutInfo.isApproved = true;
                await checkoutInfo.save();

                if (itemInfo.isSubscription) {
                    await orderHandler.createSubscriptionOrder(
                        payment.external_reference,
                        payment.additional_info.items[0].id,
                        checkoutInfo.checkoutId
                    );
                } else {
                    await orderHandler.createCakesOrder(
                        payment.external_reference,
                        payment.additional_info.items[0].id,
                        checkoutInfo.checkoutId
                    );
                }
            }
        }
        res.status(200).send("OK");
    } catch (error) {
        logger.error("Webhook error:", error);
        res.status(500).send("Internal server error");
    }
});

router.get("/cancel", async (req, res) => {
    try {
        await database.deleteCheckout(req.query.id as string);
        res.redirect("https://foxybot.win/");
    } catch (error) {
        logger.error("Error cancelling checkout:", error);
        res.status(500).json({ message: "Internal server error" });
    }
});

module.exports = router;