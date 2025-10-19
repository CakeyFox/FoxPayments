package net.cakeyfox.foxpayments.services.foxy

import kotlinx.datetime.Clock
import net.cakeyfox.foxpayments.FoxPaymentsInstance
import net.cakeyfox.foxpayments.utils.FoxyClusterUtils.relayMessageToMasterCluster
import net.cakeyfox.foxpayments.utils.RelayEmbed
import net.cakeyfox.foxpayments.utils.RelayEmbedFooter
import java.awt.Color
import kotlin.time.Duration.Companion.days

class OrderHandler(val client: FoxPaymentsInstance) {
    suspend fun createSubscriptionOrder(userId: String, itemId: String, checkoutId: String, itemName: String) {
        val itemInfo = client.database.payment.getProductFromStore(itemId)

        client.database.user.updateUser(userId) {
            userPremium.premium = true
            userPremium.premiumDate = Clock.System.now().plus(30.days)
            userPremium.premiumType = itemName
        }

        client.database.payment.registerKey(userId)

        sendSuccessMessage(userId, itemInfo?.itemName, checkoutId)
    }

    suspend fun createCakesOrder(userId: String, itemId: String, checkoutId: String) {
        val itemInfo = client.database.payment.getProductFromStore(itemId)

        client.database.user.updateUser(userId) {
            userCakes.addCakes(itemInfo!!.quantity!!.toLong())
        }

        sendSuccessMessage(userId, itemInfo?.itemName, checkoutId)
    }

    private suspend fun sendSuccessMessage(userId: String, itemName: String?, checkoutId: String) {
        relayMessageToMasterCluster(client.config, userId) {
            embeds = listOf(
                RelayEmbed(
                    title = "Obrigada por me ajudar a ficar online, yay!",
                    description = "Muito obrigada por comprar **${itemName}**! Você não sabe o quanto isso me ajuda (a comprar comida) e me manter online, você é incrível! :purple_heart:",
                    color = Color(0xe7385d).rgb,
                    footer = RelayEmbedFooter("A referência do seu pedido é $checkoutId")
                    // todo: add thumbnail
                )
            )
        }
    }
}