import type { Principal } from "@icp-sdk/core/principal";
export interface Some<T> {
    __kind__: "Some";
    value: T;
}
export interface None {
    __kind__: "None";
}
export type Option<T> = Some<T> | None;
export interface backendInterface {
    createPairingCode(pairingCode: string): Promise<void>;
    getAllPairingCodes(): Promise<Array<string>>;
    pollMessage(pairingCode: string): Promise<string>;
    registerRecipient(pairingCode: string, recipient: string): Promise<void>;
    sendMessage(pairingCode: string, message: string): Promise<void>;
}
