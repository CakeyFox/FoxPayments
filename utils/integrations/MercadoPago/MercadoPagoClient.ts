import MercadoPagoConfig, { Payment } from "mercadopago";
import { PaymentCreateData, PaymentCreateRequest } from "mercadopago/dist/clients/payment/create/types";

export default class MercadoPagoClient {
    public client: MercadoPagoConfig;
    public payment: Payment;

    constructor() {
        this.client = new MercadoPagoConfig({
            accessToken: process.env.MP_ACCESS_TOKEN,
            options: {
                timeout: 10000
            }
        });
        this.payment = new Payment(this.client);
    }

    public async createPayment(data: PaymentCreateRequest) {
        return this.payment.create({ body: data });
    }

    public async getPayment(paymentId: string) {
        return this.payment.get({ id: paymentId });
        
    }
}