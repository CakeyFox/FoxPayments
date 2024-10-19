import mongoose from 'mongoose';
import { logger } from '../../../utils/logger';
import { User } from 'discordeno/transformers';
import { RestManager } from '../RestManager';
import { Schemas } from './Schemas';
import { Background, Decoration, Layout } from '../../../utils/types/profile';
import { Item } from '../../../utils/types/item';
const { v4: uuidv4 } = require('uuid');
const rest = new RestManager();

export default class DatabaseConnection {
    public key: any;
    public user: any;
    public commands: any;
    public guilds: any;
    public riotAccount: any;
    public backgrounds: any;
    public decorations: any;
    public layouts: any;
    public items: any;
    public checkoutList: any;

    constructor() {
        mongoose.set("strictQuery", true)
        mongoose.connect(process.env.MONGODB_URI).catch((error) => {
            logger.error(`Failed to connect to database: `, error);
        });
        logger.info(`[DATABASE] Connected to database!`);

        this.user = mongoose.model('user', Schemas.userSchema);
        this.commands = mongoose.model('commands', Schemas.commandsSchema);
        this.guilds = mongoose.model('guilds', Schemas.guildSchema);
        this.key = mongoose.model('key', Schemas.keySchema);
        this.riotAccount = mongoose.model('riotAccount', Schemas.riotAccountSchema);
        this.backgrounds = mongoose.model('backgrounds', Schemas.backgroundSchema);
        this.decorations = mongoose.model('decorations', Schemas.avatarDecorationSchema);
        this.layouts = mongoose.model('layouts', Schemas.layoutsSchema);
        this.items = mongoose.model('storeItems', Schemas.storeSchema);
        this.checkoutList = mongoose.model('checkoutList', Schemas.checkoutList);
    }

    async getUser(userId: String): Promise<any> {
        if (!userId) null;
        const user: User = await rest.getUser(userId);
        let document = await this.user.findOne({ _id: user.id });

        if (!document) {
            document = new this.user({
                _id: user.id,
                userCreationTimestamp: new Date(),
                isBanned: false,
                banDate: null,
                banReason: null,
                userCakes: {
                    balance: 0,
                    lastDaily: null,
                },
                marryStatus: {
                    marriedWith: null,
                    marriedDate: null,
                    cantMarry: false,
                },
                userProfile: {
                    decoration: null,
                    decorationList: [],
                    background: "default",
                    backgroundList: ["default"],
                    repCount: 0,
                    lastRep: null,
                    layout: "default",
                    aboutme: null,
                },
                userPremium: {
                    premium: false,
                    premiumDate: null,
                    premiumType: null,
                },
                userSettings: {
                    language: 'pt-br'
                },
                petInfo: {
                    name: null,
                    type: null,
                    rarity: null,
                    level: 0,
                    hungry: 100,
                    happy: 100,
                    health: 100,
                    lastHungry: null,
                    lastHappy: null,
                    isDead: false,
                    isClean: true,
                    food: []
                },
                userTransactions: [],
                riotAccount: {
                    isLinked: false,
                    puuid: null,
                    isPrivate: false,
                    region: null
                },
                premiumKeys: [],
                roulette: {
                    availableSpins: 5,
                }
            }).save();
        }

        return document;
    }

    async getProductFromStore(productId: string): Promise<Item> {
        let document = await this.items.findOne({ itemId: productId });
        return document;
    }

    async getCheckout(checkoutId: string): Promise<any> {
        let document = await this.checkoutList.findOne({ checkoutId: checkoutId });
        return document;
    }
    
    async getCheckoutByUserId(userId: string): Promise<any> {
        let document = await this.checkoutList.findOne({ userId: userId });
        return document;
    }

    async deleteCheckout(checkoutId: string) {
        const document = await this.checkoutList.findOne({ checkoutId: checkoutId });
        if (!document) return false;
        await this.checkoutList.deleteOne({ checkoutId: checkoutId });
        return true;
    }

    async registerKey(user: String, expiresAt: Date, pType: Number): Promise<Key> {
        const key = uuidv4();
        const userDocument = await this.getUser(user);

        userDocument.premiumKeys.push({
            key: key,
            used: false,
            expiresAt: expiresAt,
            pType: pType,
            guild: null,
        });

        await userDocument.save();
        return userDocument.premiumKeys[userDocument.premiumKeys.length - 1];
    }

    async getKey(key: string) {
        var document = await this.user.findOne({ premiumKeys: { $elemMatch: { key: key } } });

        if (!document) {
            return null;
        } else {
            return document;
        }
    }

    async createKey(userId, pType: string): Promise<void> {
        const key = uuidv4();
        const userDocument = await this.getUser(userId);

        userDocument.premiumKeys.push({
            key: key,
            used: false,
            expiresAt: new Date(Date.now() + 2592000000),
            pType: pType,
            guild: null,
        });
        await userDocument.save();
        return key;
    }
}

interface Key {
    key: string;
    used: boolean;
    expiresAt: Date;
    pType: number;
    guild: string;
}