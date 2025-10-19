package net.cakeyfox.foxpayments.routes.webhook

import com.mercadopago.resources.payment.Payment
import io.ktor.http.HttpStatusCode
import io.ktor.server.application.ApplicationCall
import io.ktor.server.request.receiveText
import io.ktor.server.response.respond
import io.ktor.server.response.respondText
import io.ktor.server.routing.Route
import io.ktor.server.routing.post
import mu.KotlinLogging
import net.cakeyfox.foxpayments.FoxPaymentsInstance
import net.cakeyfox.foxpayments.utils.MercadoPagoOrder
import net.cakeyfox.foxy.database.data.checkout.Checkout
import net.cakeyfox.foxy.database.data.store.StoreItem

class PostMercadoPagoWebhook {
    companion object {
        private val logger = KotlinLogging.logger { }
    }

    fun Route.getMercadoPagoPost(client: FoxPaymentsInstance) {
        val PAYMENT_UPDATED = "payment.updated"
        val ORDER_CREATED = "order.created"
        val PAYMENT_APPROVED = "approved"
        val PAYMENT_REFUNDED = "refunded"

        post("/mercadopago/webhook") {
            val body = call.receiveText()
            val order = client.json.decodeFromString<MercadoPagoOrder>(body)
            val paymentId = order.data.id
            val payment = client.mercadoPagoClient.getPayment(paymentId) ?: return@post
            val itemInfo = client.database.payment.getProductFromStore(payment.additionalInfo?.items[0]?.id!!)
                ?: return@post
            val checkoutInfo = client.database.payment.getCheckoutByUserId(payment.externalReference) ?: return@post

            try {
                logger.info { "Payment update: ${payment.id} - Status: ${payment.status}" }

                when (payment.status) {
                    PAYMENT_APPROVED -> processPaymentApproved(call, client, checkoutInfo, payment, itemInfo)
//                    PAYMENT_REFUNDED ->
                }

                call.respond(HttpStatusCode.OK, "OK")
            } catch (e: Exception) {
                logger.error(e) { "Error processing payment" }
                call.respond(HttpStatusCode.BadRequest, e.message ?: "Error processing payment")
            }
        }
    }

    private suspend fun processPaymentApproved(
        call: ApplicationCall,
        client: FoxPaymentsInstance,
        checkoutInfo: Checkout,
        payment: Payment,
        itemInfo: StoreItem
    ) {
        if (checkoutInfo.isApproved) return call.respondText(
            status = HttpStatusCode.Forbidden,
            text = "Payment already approved",
        )

        println("Approved! ${itemInfo.itemName}")
        client.database.payment.updateCheckout(checkoutInfo.checkoutId) {
            this.paymentId = payment.id.toString()
            this.isApproved = true
        }

        if (itemInfo.isSubscription) {
            client.order.createSubscriptionOrder(
                payment.externalReference,
                payment.additionalInfo.items[0].id,
                checkoutInfo.checkoutId,
                itemInfo.itemName
            )
        } else {
            client.order.createCakesOrder(
                payment.externalReference,
                payment.additionalInfo.items[0].id,
                checkoutInfo.checkoutId
            )
        }
    }
}