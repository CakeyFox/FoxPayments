export interface MercadoPagoOrder {
    action: string;
    api_version: string;
    application_id: string;
    date_created: string;
    id: string;
    live_mode: boolean;
    type: string;
    user_id: number,
    data: {
        id: string
    }
}