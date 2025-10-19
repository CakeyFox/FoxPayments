package net.cakeyfox.foxpayments.routes

import io.ktor.http.HttpStatusCode
import io.ktor.server.response.respond
import io.ktor.server.response.respondRedirect
import io.ktor.server.routing.Route
import io.ktor.server.routing.get
import net.cakeyfox.foxpayments.FoxPaymentsInstance

class GetMercadoPagoCheckout {
    fun Route.getMercadoPagoCheckout(client: FoxPaymentsInstance) {
        get("/checkout/mercadopago") {
            val checkoutId = call.queryParameters["checkoutId"] ?: return@get call.respond(
                HttpStatusCode.BadRequest
            )

            try {
                val checkoutInfo = client.database.payment.getCheckout(checkoutId)
                val itemInfo =
                    client.database.payment.getProductFromStore(checkoutInfo!!.itemId)
                        ?: return@get call.respond(HttpStatusCode.NotFound)

               val paymentUrl = client.mercadoPagoClient.createPayment(itemInfo, checkoutInfo.userId)
                call.respondRedirect(paymentUrl!!)
            } catch (_: Exception) {
                return@get call.respond(HttpStatusCode.InternalServerError)
            }

        }
    }
}