package net.cakeyfox.foxpayments.routes

import io.ktor.server.response.respondText
import io.ktor.server.routing.Route
import io.ktor.server.routing.get

class GetPaymentFailedRoute {
    fun Route.getPaymentFailed() {
        get("/failed") {
            call.respondText("Failed")
        }
    }
}