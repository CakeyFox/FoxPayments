package net.cakeyfox.foxpayments.utils

import kotlinx.serialization.SerialName
import kotlinx.serialization.Serializable

@Serializable
data class MercadoPagoOrder(
    val action: String,
    @SerialName("api_version")
    val apiVersion: String,
    @SerialName("date_created")
    val dateCreated: String,
    val id: Long,
    @SerialName("live_mode")
    val liveMode: Boolean,
    val type: String,
    @SerialName("user_id")
    val userId: Long,
    val data: Data
) {
    @Serializable
    data class Data(val id: String)
}
