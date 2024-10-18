import { MercadoPagoOrder } from "../../utils/types/order";
import { RestManager } from "./RestManager";

export default class OrderHandler {
    private rest: RestManager;

    constructor() {
        this.rest = new RestManager();
    }

    async createOrder(order: MercadoPagoOrder) {
        this.rest.sendDirectMessage(order.data.id, {
            embeds: [{
                title: "Obrigada por me ajudar a ficar online, yay!",
                description: "Muito obrigada por comprar o premium! Você não sabe o quanto isso me ajuda (a comprar comida) e me manter online, você é incrível! 💜",
                color: 0xe7385d,
                image: {
                    url: "https://cdn.discordapp.com/attachments/1078322762550083736/1160621235525386240/tier1.png?ex=671292c1&is=67114141&hm=1b3dc9a6bd96a211236fba4d78818ff466ffbf9bba115cb91b4663e49d3fd5a5&"
                },
                footer: {
                    text: "Obrigada por me ajudar a ficar online!"
                }
            }]
        });
    }
}