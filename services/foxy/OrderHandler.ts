import { Embed } from "discordeno/*";
import { database } from "../..";
import { RestManager } from "./RestManager";

export default class OrderHandler {
    private rest: RestManager;

    constructor() {
        this.rest = new RestManager();
    }

    async createSubscriptionOrder(userId: string, itemId: string, checkoutId: string) {
        const itemInfo = await database.getProductFromStore(itemId);
        const userInfo = await database.getUser(userId);

        userInfo.userPremium = {
            premium: true,
            premiumDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
            premiumType: itemInfo.itemName,
        };
        await userInfo.save();

        this.sendMessage(this.createEmbed(itemInfo.itemName, checkoutId), userId);
    }

    async createCakesOrder(userId: string, itemId: string, checkoutId: string) {
        const itemInfo = await database.getProductFromStore(itemId);
        const userInfo = await database.getUser(userId);

        userInfo.userCakes.balance += itemInfo.quantity;
        await database.createTransaction(userId, itemInfo.quantity);
        await userInfo.save();

        this.sendMessage(this.createEmbed(`${itemInfo.quantity} Cakes`, checkoutId), userId);
    }

    private createEmbed(itemName: string, checkoutId: string): Embed {
        return {
            title: "Obrigada por me ajudar a ficar online, yay!",
            description: `Muito obrigada por comprar **${itemName}**! Você não sabe o quanto isso me ajuda (a comprar comida) e me manter online, você é incrível! :purple_heart:`,
            color: 0xe7385d,
            footer: { text: `A referência do seu pedido é ${checkoutId}` },
            thumbnail: { url: "https://cdn.discordapp.com/emojis/853366914054881310.png?v=1" },
        };
    }

    private sendMessage(embed: Embed, userId: string) {
        this.rest.sendDirectMessage(userId, { embeds: [embed] });
    }
}