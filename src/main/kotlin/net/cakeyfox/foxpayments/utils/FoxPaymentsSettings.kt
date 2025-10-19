package net.cakeyfox.foxpayments.utils

import kotlinx.serialization.Serializable

@Serializable
data class FoxPaymentsSettings(
    val server: Server
) {
    @Serializable
    data class Server(
        val port: Int,
        val authorization: String,

        val mercadopago: MercadoPagoConfig,
        val database: Database,
        val foxy: FoxySettings
    ) {
        @Serializable
        data class MercadoPagoConfig(
            val accessToken: String
        )

        @Serializable
        data class Database(
            val address: String,
            val databaseName: String,
            val user: String,
            val password: String,
            val requestTimeout: Long
        )

        @Serializable
        data class FoxySettings(
            val masterClusterUrl: String,
            val authorization: String,
        )
    }
}