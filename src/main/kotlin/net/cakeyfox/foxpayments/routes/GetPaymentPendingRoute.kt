package net.cakeyfox.foxpayments.routes

import io.ktor.server.response.respondText
import io.ktor.server.routing.Route
import io.ktor.server.routing.get

class GetPaymentPendingRoute {
    fun Route.getPaymentPendingRoute() {
        get("/pending") {
            call.respondText("Pending")
        }
    }
}