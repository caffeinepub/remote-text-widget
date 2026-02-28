import type { Principal } from "@icp-sdk/core/principal";
export interface Some<T> {
    __kind__: "Some";
    value: T;
}
export interface None {
    __kind__: "None";
}
export type Option<T> = Some<T> | None;
export interface Stroke {
    color: string;
    thickness: number;
    points: Array<[number, number]>;
}
export interface AudioMessage {
    audioData: string;
    sender: string;
    timestamp: bigint;
}
export interface backendInterface {
    addAudioMessage(roomCode: string, message: AudioMessage): Promise<void>;
    addStroke(roomCode: string, stroke: Stroke): Promise<void>;
    createRoom(roomName: string): Promise<string>;
    getAllRoomCodes(): Promise<Array<string>>;
    getAudioMessages(roomCode: string): Promise<Array<AudioMessage>>;
    getStrokes(roomCode: string): Promise<Array<Stroke>>;
    joinRoom(roomCode: string, user: string): Promise<void>;
}
