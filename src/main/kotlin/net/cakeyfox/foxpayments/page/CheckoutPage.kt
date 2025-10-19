package net.cakeyfox.foxpayments.page

import kotlinx.html.a
import kotlinx.html.body
import kotlinx.html.button
import kotlinx.html.div
import kotlinx.html.h1
import kotlinx.html.h2
import kotlinx.html.h3
import kotlinx.html.h4
import kotlinx.html.head
import kotlinx.html.header
import kotlinx.html.html
import kotlinx.html.id
import kotlinx.html.img
import kotlinx.html.li
import kotlinx.html.link
import kotlinx.html.main
import kotlinx.html.meta
import kotlinx.html.nav
import kotlinx.html.p
import kotlinx.html.script
import kotlinx.html.section
import kotlinx.html.stream.createHTML
import kotlinx.html.title
import kotlinx.html.ul
import net.cakeyfox.foxy.database.data.checkout.Checkout
import net.cakeyfox.foxy.database.data.store.StoreItem

fun checkoutPage(checkoutInfo: Checkout, itemInfo: StoreItem): String {
    return createHTML().html {
        head {
            script(src = "https://www.mercadopago.com/v2/security.js") { }
            link(rel = "stylesheet", type = "text/css", href = "/styles/main.css")
            meta(name = "viewport", content = "width=device-width, initial-scale=1.0")
            title { +"FoxPayments | Checkout" }
        }

        body {
            header {
                nav("navigation-bar fixed") {
                    this.id = "navigation-bar"

                    div("left-entries") {
                        a("https://foxybot.xyz", classes = "foxy-navbar-logo") {
                            img(src = "/assets/img/logo.png", classes = "logo")
                        }
                    }
                }
            }

            main {
                h1("title") { +itemInfo.itemName }
                h3("price") { +"${itemInfo.price} BRL" }
                h3("description") { +"${itemInfo.description} ${checkoutInfo.userId}" }

                h2("description") {
                    +"Pagamento processado por"
                    img(classes = "mercadopago-logo") {
                        this.src = "/assets/img/integrations/mercadopago.svg"
                    }
                }

                section("terms") {
                    h4 { +"Ao clicar em \"Continuar a Compra\", você concorda que:" }
                    ul {
                        li { +"O dinheiro utilizado é seu ou você possui autorização para usá-lo." }
                        li { +"Não oferecemos reembolso para produtos vendidos, pois se tratam de produtos digitais." }
                        li { +"Você não está imune a banimentos, nem garantimos a remoção de um banimento." }
                        li { +"Todos os itens adquiridos não possuem valor monetário. Transações realizadas com terceiros não são de nossa responsabilidade, e você pode ser banido caso se envolva com esse tipo de negociação." }
                        li { +"O pagamento pelos nossos serviços não garante atendimento exclusivo." }
                        li { +"Em caso de problemas com o produto, entre em contato com nosso suporte." }
                    }
                }

                div("button-container") {
                    a("/cancel?id=${checkoutInfo.checkoutId}") {
                        button(classes = "danger") { +"Cancelar compra" }
                    }

                    a("/checkout/mercadopago?checkoutId=${checkoutInfo.checkoutId}") {
                        button(classes = "success") { +"Continuar a compra" }
                    }
                }

                p("warning") {
                    +"Escolheu o produto errado? Clique em \"Cancelar compra\" antes de escolher outro produto!"
                }
            }
        }
    }
}