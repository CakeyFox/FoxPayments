import { Embed } from "discordeno/*";
import { database } from "../..";
import { RestManager } from "./RestManager";

export default class OrderHandler {
    private rest: RestManager;

    constructor() {
        this.rest = new RestManager();
    }

    async createSubscriptionOrder(userId: string, itemId: string) {
        const itemInfo = await database.getProductFromStore(itemId);
        const userInfo = await database.getUser(userId);
        const checkoutInfo = await database.getCheckoutByUserId(userId);
        checkoutInfo.isApproved = true;
        userInfo.userPremium.premium = true;
        userInfo.userPremium.premiumDate = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);
        userInfo.userPremium.premiumType = itemInfo.itemName;
        await userInfo.save();
        await checkoutInfo.save();

        const embed = {
            title: "Obrigada por me ajudar a ficar online, yay!",
            description: `Muito obrigada por comprar o **${itemInfo.itemName}**! Você não sabe o quanto isso me ajuda (a comprar comida) e me manter online, você é incrível! 💜`,
            color: 0xe7385d,
            image: {
                url: "https://cdn.discordapp.com/attachments/1078322762550083736/1160621235525386240/tier1.png?ex=671292c1&is=67114141&hm=1b3dc9a6bd96a211236fba4d78818ff466ffbf9bba115cb91b4663e49d3fd5a5&"
            },
            thumbnail: {
                url: "https://cdn.discordapp.com/emojis/853366914054881310.png?v=1"
            },
            footer: {
                text: "Obrigada por me ajudar a ficar online!"
            }
        };

        this.sendMessage(embed, userId);
    }

    async createCakesOrder(userId: string, itemId: string) {
        const itemInfo = await database.getProductFromStore(itemId);
        const userInfo = await database.getUser(userId);
        const checkoutInfo = await database.getCheckoutByUserId(userId);

        const embed = {
            title: "Obrigada por me ajudar a ficar online, yay!",
            description: `Muito obrigada por comprar **${itemInfo.quantity} Cakes! Você não sabe o quanto isso me ajuda (a comprar comida) e me manter online, você é incrível! 💜`,
            color: 0xe7385d,
            thumbnail: {
                url: "https://cdn.discordapp.com/emojis/853366914054881310.png?v=1"
            },
            footer: {
                text: "Obrigada por me ajudar a ficar online!"
            }
        };

        userInfo.userCakes.balance += itemInfo.quantity;
        checkoutInfo.isApproved = true;
        await database.createTransaction(userId, itemInfo.quantity);
        await userInfo.save();
        await checkoutInfo.save();

        this.sendMessage(embed, userId);
    }

    sendMessage(embed: Embed, userId: string) {
        this.rest.sendDirectMessage(userId, {
            embeds: [embed]
        });
    }
}