package net.cakeyfox.foxpayments.routes

import io.ktor.server.response.respondRedirect
import io.ktor.server.response.respondText
import io.ktor.server.routing.Route
import io.ktor.server.routing.get
import net.cakeyfox.foxpayments.FoxPaymentsInstance

class CancelCheckoutRoute {
    fun Route.deleteCheckout(client: FoxPaymentsInstance) {
        get("/cancel") {
            val checkoutId = call.parameters["id"] ?: return@get call.respondText("Missing checkout ID")
            client.database.payment.deleteCheckout(checkoutId)

            call.respondRedirect("https://foxybot.xyz/")
        }
    }
}