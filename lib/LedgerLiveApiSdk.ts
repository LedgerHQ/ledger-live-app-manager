
import { JSONRPCServerAndClient, JSONRPCClient, JSONRPCServer, JSONRPCParams } from "json-rpc-2.0";
import {
    RequestAccountParams,
    ListCurrenciesParams,
    SignTransactionParams,
    Transport,
    ExchangeType,
    ExchangePayload,
    EstimatedFees,
    FeesLevel,
    EcdsaSignature,
    DeviceDetails,
    ApplicationDetails
} from './LedgerLiveApiSdk.types';
import {
    Account,
    Currency,
    Transaction,
    SignedTransaction,
} from "./types";
import {
    deserializeAccount,
    serializeTransaction,
    deserializeSignedTransaction,
    serializeSignedTransaction,
} from "./serializers";
import Logger from './logger';
import {
    DeviceBridge
} from './DeviceBridge'

const defaultLogger = new Logger('LL-API');

export default class LedgerLiveApi {
    private transport: Transport;
    private logger: Logger;
    private serverAndClient?: JSONRPCServerAndClient;

    constructor(transport: Transport, logger: Logger = defaultLogger) {
        this.transport = transport;
        this.logger = logger;
    }

    /**
     * Wrapper to api request for logging
     */
    private async _request(method: string, params?: JSONRPCParams | undefined, clientParams?: void | undefined): Promise<any> {
        if (!this.serverAndClient) {
            this.logger.error(`not connected`, method);
            throw new Error("Ledger Live API not connected");
        }

        this.logger.log(`request - ${method}`, params, clientParams);
        try {
            const result = await this.serverAndClient.request(method, params, clientParams);
            this.logger.log(`response - ${method}`, params, clientParams);
            return result;
        } catch (error) {
            this.logger.warn(`error - ${method}`, params, clientParams);
            throw error;
        }
    }

    /**
     * Connect the SDK to the Ledger Live instance
     */
    connect() {
        const serverAndClient = new JSONRPCServerAndClient(
            new JSONRPCServer(),
            new JSONRPCClient((payload) => this.transport.send(payload)),
        );

        this.transport.onMessage = (payload) => serverAndClient.receiveAndSend(payload);
        this.transport.connect();
        this.serverAndClient = serverAndClient;
        this.logger.log('connected', this.transport);
    }

    /**
     * Disconnect the SDK
     */
    async disconnect() {
        delete this.serverAndClient;
        await this.transport.disconnect();
        this.logger.log('disconnected', this.transport);
    }

    /** Legder Live Methods */

    /**
     * Let user choose an account in a Ledger Live, providing filters for choosing currency or allowing add account.
     * 
     * @param {RequestAccountParams} params - parameters for the request modal
     * @returns Account
     */
    async requestAccount(params: RequestAccountParams): Promise<Account> {
        const rawAccount = await this._request('account.request', params || {});

        return deserializeAccount(rawAccount);
    }

    /**
     * List accounts added by user on Ledger Live
     * 
     * @returns {Account[]}
     */
    async listAccounts(): Promise<Account[]> {
        const rawAccounts = await this._request('account.list');

        return rawAccounts.map(deserializeAccount);
    }

    /**
     * List crypto-currencies supported by Ledger Live, providing filters by name or ticker
     * 
     * @param {ListCurrenciesParams} params - filters for currencies
     * @returns {Currency[]}
     */
    async listCurrencies(params?: ListCurrenciesParams): Promise<Currency[]> {
        return this._request('currency.list', params || {});
    }

    /**
     * Let user verify it's account address on his device through Ledger Live
     * 
     * @param accountId - LL id of the account
     * @returns string - the verified address
     */
    async receive(accountId: string): Promise<string> {
        return this._request('account.receive', { accountId });
    }

    /**
     * Let user sign a transaction through Ledger Live
     * @param {string} accountId - LL id of the account 
     * @param {Transaction} transaction  - the transaction in the currency family-specific format
     * @param {SignTransactionParams} params - parameters for the sign modal
     * 
     * @returns {SignedTransaction}
     */
    async signTransaction(accountId: string, transaction: Transaction, params?: SignTransactionParams): Promise<SignedTransaction> {
        const rawSignedTransaction = await this._request('transaction.sign', {
            accountId,
            transaction: serializeTransaction(transaction),
            params: params || {},
        });

        return deserializeSignedTransaction(rawSignedTransaction);
    }

    /**
     * Broadcast a signed transaction through Ledger Live, providing an optimistic Operation givent by signTransaction
     * @param {string} accountId - LL id of the account
     * @param {SignedTransaction} signedTransaction - a signed transaction given by LL when signing
     * 
     * @returns {string} - hash of the transaction
     */
    async broadcastSignedTransaction(accountId: string, signedTransaction: SignedTransaction): Promise<string> {
        return this._request('transaction.broadcast', {
            accountId,
            signedTransaction: serializeSignedTransaction(signedTransaction),
        });
    }

    /**
     * Estimate fees required to successfully broadcast a transaction.
     * @param {string} accountId - LL id of the account
     * @param {Transaction} transaction - the transaction to estimate
     * 
     * @returns {EstimatedFees} - Estimated fees for 3 level of confirmation speed
     */
    async estimateTransactionFees(accountId: string, transaction: Transaction): Promise<EstimatedFees> {
        throw new Error('Function is not implemented yet');
    }

    /**
     * Synchronize an account with its network and return an updated view of the account
     * @param {string} accountId The id of the account to synchronize
     * 
     * @returns {Account} An updated view of the account 
     */
    async synchronizeAccount(accountId: string): Promise<Account> {
        throw new Error('Function is not implemented yet');
    }

    /**
     * Start the exchange process by generating a nonce on Ledger device
     * @param {ExchangeType} exchangeType 
     * @param {string} partnerName 
     * 
     * @returns {string} The nonce of the exchange
     */
    async initExchange(exchangeType: ExchangeType, partnerName: String): Promise<string> {
        throw new Error('Function is not implemented yet');
    }

    /**
     * Complete an exchange process by passing by the exchange content and its signature.
     * @param {ExchangePayload} exchangePayload
     * @param {EcdsaSignature} payloadSignature  
     * @param {FeesLevel} txFeesLevel 
     */
    async completeExchange(exchangePayload: ExchangePayload, payloadSignature: EcdsaSignature, txFeesLevel: FeesLevel): Promise<void> {
        throw new Error('Function is not implemented yet');
    }

    /**
     * Get information about a currently connected device (firmware version...)
     * 
     * @returns {Promise<DeviceDetails>} Informations about a currently connected device
     */
    async getDeviceInfo(): Promise<DeviceDetails> {
        throw new Error('Function is not implemented yet');
    }

    /**
     * List applications opened on a currently connected device
     * 
     * @returns {Promise<ApplicationDetails[]>} The list of applications
     */
    async listApps(): Promise<ApplicationDetails[]> {
        throw new Error('Function is not implemented yet');
    }

    /**
     * Open a bridge to an application to exchange APDUs with a device application
     * @param {string} appName The name of the application to bridge
     * @param {<Result>(DeviceBridge) => Promise<Result>} handler A function using the bridge to send command to a device
     * 
     * @returns {Promise<Result>} The result of the handler function
     */
    async bridgeApp<Result>(appName: string, handler: <Result>(deviceBridge: DeviceBridge) => Promise<Result>): Promise<Result> {
        throw new Error('Function is not implemented yet');
    }

    /**
     * Open a bridge to a the device dashboard to exchange APDUs
     * @param {<Result>(DeviceBridge) => Promise<Result>} handler A function using the bridge to send command to a device
     * 
     * @returns {Promise<Result>} The result of the handler function
     */
    async bridgeDashboard<Result>(handler: <Result>(deviceBridge: DeviceBridge) => Promise<Result>): Promise<Result> {
        throw new Error('Function is not implemented yet');
    }

}