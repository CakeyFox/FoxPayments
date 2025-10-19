package net.cakeyfox.foxpayments.routes

import io.ktor.http.ContentType
import io.ktor.http.HttpStatusCode
import io.ktor.server.response.respond
import io.ktor.server.response.respondText
import io.ktor.server.routing.Route
import io.ktor.server.routing.get
import net.cakeyfox.foxpayments.FoxPaymentsInstance
import net.cakeyfox.foxpayments.page.checkoutPage

class GetCheckoutRoute {
    fun Route.getCheckoutId(client: FoxPaymentsInstance) {
        get("/checkout/id/{checkoutId}") {
            val checkoutId = call.parameters["checkoutId"] ?: return@get call.respond(HttpStatusCode.BadRequest)
            val checkoutInfo = client.database.payment.getCheckout(checkoutId)
                ?: return@get call.respondText("Checkout not found", status = HttpStatusCode.NotFound)

            val itemInfo = client.database.payment.getProductFromStore(checkoutInfo.itemId)
            ?: return@get call.respondText("Item not found", status = HttpStatusCode.NotFound)

            call.respondText(ContentType.Text.Html) {
                checkoutPage(checkoutInfo, itemInfo)
            }
        }
    }
}