package net.cakeyfox.foxpayments

import com.mercadopago.MercadoPagoConfig
import io.ktor.serialization.kotlinx.json.json
import io.ktor.server.application.install
import io.ktor.server.auth.Authentication
import io.ktor.server.auth.UserIdPrincipal
import io.ktor.server.auth.authenticate
import io.ktor.server.auth.bearer
import io.ktor.server.engine.embeddedServer
import io.ktor.server.http.content.staticResources
import io.ktor.server.netty.Netty
import io.ktor.server.plugins.contentnegotiation.ContentNegotiation
import io.ktor.server.response.respondText
import io.ktor.server.routing.get
import io.ktor.server.routing.routing
import kotlinx.serialization.json.Json
import mu.KotlinLogging
import net.cakeyfox.foxpayments.routes.CancelCheckoutRoute
import net.cakeyfox.foxpayments.routes.GetCheckoutRoute
import net.cakeyfox.foxpayments.routes.GetMercadoPagoCheckout
import net.cakeyfox.foxpayments.routes.GetPaymentFailedRoute
import net.cakeyfox.foxpayments.routes.GetPaymentPendingRoute
import net.cakeyfox.foxpayments.routes.webhook.PostMercadoPagoWebhook
import net.cakeyfox.foxpayments.services.foxy.OrderHandler
import net.cakeyfox.foxpayments.utils.FoxPaymentsSettings
import net.cakeyfox.foxpayments.utils.MercadoPagoOrder
import net.cakeyfox.foxpayments.utils.integrations.mercadopago.MercadoPagoClient
import net.cakeyfox.foxy.database.core.DatabaseClient
import java.util.concurrent.TimeUnit

class FoxPaymentsInstance(val config: FoxPaymentsSettings) {
    private val logger = KotlinLogging.logger { }
    private val server = embeddedServer(Netty, config.server.port) {
        install(ContentNegotiation) {
            json()
        }

        routing {
            get("/") { call.respondText("FoxPayments") }
            staticResources("/", "frontend")

            GetCheckoutRoute().apply { getCheckoutId(this@FoxPaymentsInstance) }
            CancelCheckoutRoute().apply { deleteCheckout(this@FoxPaymentsInstance) }
            GetPaymentFailedRoute().apply { getPaymentFailed() }
            GetPaymentPendingRoute().apply { getPaymentPendingRoute() }
            PostMercadoPagoWebhook().apply { getMercadoPagoPost(this@FoxPaymentsInstance) }
            GetMercadoPagoCheckout().apply { getMercadoPagoCheckout(this@FoxPaymentsInstance) }
        }
    }
    val json = Json {
        ignoreUnknownKeys = true
    }
    val order = OrderHandler(this)
    val mercadoPagoClient = MercadoPagoClient()
    val database = DatabaseClient()
        .setUser(config.server.database.user)
        .setPassword(config.server.database.password)
        .setDatabase(config.server.database.databaseName)
        .setTimeout(config.server.database.requestTimeout, TimeUnit.MILLISECONDS)
        .setAddress(config.server.database.address)
        .also { it.connect() }

    init {
        MercadoPagoConfig.setAccessToken(config.server.mercadopago.accessToken)
        server.start(wait = true)

        Runtime.getRuntime().addShutdownHook(Thread {
            logger.info { "Shutting down..." }
            server.stop(10, 10, TimeUnit.SECONDS)
        })
    }
}