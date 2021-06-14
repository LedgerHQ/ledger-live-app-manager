export type MessageHandler = (payload: Object) => Promise<void>;

export interface Transport {
    connect(): void;
    disconnect(): void;
    onMessage: MessageHandler | undefined; 
    send(payload: Object) : Promise<void>;
}


export type RequestAccountParams = {
    currencies?: string[],
    allowAddAccount?: boolean,
}

export type ListCurrenciesParams = {
    name?: string,
    ticker?: string,
}

export type SignTransactionParams = {
    useApp?: string,
}

/**
 * Enum describing the different types of exchanges.
 */
export enum ExchangeType {
    Swap = 'swap',
    Buy = 'buy',
    Fund = 'fund'
}

/**
 * Metadata used to describe a secure exchange between a Ledger device 
 * and a partner (for sell, swap and funding)
 */
export type ExchangePayload = {
    /**
     * Trader or user's email
     */
    email: string,
    /**
     * Displayable name of the account
     */
    accountName: string,
    /**
     * Ticker of the cryptocurrency to transfer
     */
    inCurrency: string,
    /**
     * Amount to transfer
     */
    inAmount: string,
    /**
     * Address to transfer to
     */
    inAddress: string,

    /**
     * Ticker of the currency the user gets back
     */
    outCurrency?: string,
    /**
     * The amount the user gets back 
     */
    outAmount?: string,
    /**
     * Refund address for swap exchange only
     */
    outAddress?: string,
    /**
     * The nonce generated by the device and returned by the initExchange function
     */
    nonce: string
}

export type EcdsaSignature = {
    r: Buffer,
    s: Buffer
}

export enum FeesLevel {
    Low = 'low',
    Standard = 'standard',
    High = 'high'
}

export type EstimatedFees = {
    low: number,
    standard: number,
    high: number 
}

/**
 * Informations about a device application
 */
export type ApplicationDetails = {
    /**
     * Name of the application
     */
    name: string,
    /**
     * Version of the application (SemVer)
     */
    version: string
}

export enum DeviceModel {
    Blue = 'blue',
    NanoS = 'nanoS',
    NanoX = 'nanoX'
}

/**
 * Information about a device
 */
export type DeviceDetails = {
    /**
     * The model of the device (Nano S, Nano X...)
     */
    modelId: DeviceModel,
    /**
     * The version of the firmware
     */
    version: string,
}