import MercadoPagoConfig, { Payment, Preference } from "mercadopago";
import { PaymentCreateRequest } from "mercadopago/dist/clients/payment/create/types";

export default class MercadoPagoClient {
    public client: MercadoPagoConfig;
    public payment: Payment;
    public preference: Preference;

    constructor() {
        this.client = new MercadoPagoConfig({
            accessToken: process.env.MP_ACCESS_TOKEN,
            options: {
                timeout: 10000
            }
        });
        this.payment = new Payment(this.client);
        this.preference = new Preference(this.client);
    }

    public async createPayment(data) {
        try {
            const preference = {
               body: {
                items: [
                    {
                        id: data.id,
                        title: data.title,
                        unit_price: data.price,
                        quantity: 1,
                        currency_id: "BRL",
                        description: "Premium",
                    }
                ],
                external_reference: data.userId,
                back_urls: {
                    success: `${process.env.BASE_URL}/`,
                    failure: `${process.env.BASE_URL}/`,
                    pending: `${process.env.BASE_URL}/`,
                },
                auto_return: "approved",
               }
            };
            const response = await this.preference.create(preference);
            return response.init_point;
        } catch (error) {
            console.log("Error: ", error);
        }
    }

    public async getPayment(paymentId: string) {
        return this.payment.get({ id: paymentId });
    }
}