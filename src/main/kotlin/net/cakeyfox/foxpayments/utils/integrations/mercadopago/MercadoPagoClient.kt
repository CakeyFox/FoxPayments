package net.cakeyfox.foxpayments.utils.integrations.mercadopago

import com.mercadopago.client.payment.PaymentClient
import com.mercadopago.client.preference.PreferenceBackUrlsRequest
import com.mercadopago.client.preference.PreferenceClient
import com.mercadopago.client.preference.PreferenceItemRequest
import com.mercadopago.client.preference.PreferenceRequest
import com.mercadopago.resources.payment.Payment
import mu.KotlinLogging
import net.cakeyfox.foxy.database.data.checkout.Checkout
import net.cakeyfox.foxy.database.data.store.StoreItem

class MercadoPagoClient {
    companion object {
        private val logger = KotlinLogging.logger { }
    }

    private val preferenceClient = PreferenceClient()
    private val paymentClient = PaymentClient()

    fun createPayment(item: StoreItem, checkout: Checkout): String? {
        try {
            val value = checkout.valueToPay?.takeIf { it > 0.0 } ?: item.price

            val item = PreferenceItemRequest.builder()
                .id(item.itemId)
                .title(item.itemName)
                .description("${item.itemName} - ${checkout.userId}")
                .quantity(1)
                .currencyId("BRL")
                .unitPrice(value.toBigDecimal())
                .build()
            val preferenceRequest = PreferenceRequest.builder()
                .items(listOf(item))
                .externalReference(checkout.userId)
                .backUrls(
                    PreferenceBackUrlsRequest.builder()
                        .success("https://foxybot.xyz/")
                        .failure("https://foxybot.xyz/")
                        .pending("https://foxybot.xyz/")
                        .build()
                )
                .autoReturn("approved")
                .build()

            val preference = preferenceClient.create(preferenceRequest)
            return preference.initPoint
        } catch (e: Exception) {
            logger.error(e) { "Error creating payment" }
            return null
        }
    }

    fun getPayment(paymentId: String): Payment? {
        try {
           val payment = paymentClient.get(paymentId.toLong())
            return payment
        } catch (e: Exception) {
            logger.error(e) { "Error retrieving payment" }
            return null
        }
    }
}