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

router.get("/pending", async (req, res) => {
    const { collection_id, collection_status, external_reference, payment_type, preference_id, site_id, processing_mode, merchant_account_id } = req.query;

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
        case MercadoPagoEvents.PAYMENT_UPDATED: {
            const paymentId = body.data.id;

            try {
                const payment = await mercadoPago.getPayment(paymentId);
                const itemInfo = await database.getProductFromStore(payment.additional_info.items[0].id);
                logger.info(`Received payment update by ${payment.external_reference} for payment ${payment.id} with status ${payment.status} with product ${payment.additional_info.items[0].id}`);

                if (payment.status === MercadoPagoStatus.PAYMENT_APPROVED) {
                    switch (itemInfo.isSubscription) {
                        case true: {
                            orderHandler.createSubscriptionOrder(
                                payment.external_reference,
                                payment.additional_info.items[0].id
                            );
                            break;
                        }

                        case false: {
                            orderHandler.createCakesOrder(
                                payment.external_reference,
                                payment.additional_info.items[0].id
                            );
                        }
                    }
                }
            } catch (err) {
                logger.error(err);
                return res.status(500).send("Internal server error");
            }
        }
    }
    res.status(200).send("OK");
});


router.get("/cancel", async (req, res) => {
    await database.deleteCheckout(req.query.id);
    res.redirect("https://foxybot.win/");
});

module.exports = router;