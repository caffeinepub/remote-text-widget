import Map "mo:core/Map";
import Text "mo:core/Text";
import List "mo:core/List";
import Runtime "mo:core/Runtime";
import Iter "mo:core/Iter";
import Migration "migration";
import Array "mo:core/Array";
import Nat "mo:core/Nat";
import Time "mo:core/Time";

(with migration = Migration.run)
actor {
  type Stroke = {
    points : [(Float, Float)];
    color : Text;
    thickness : Float;
  };

  type AudioMessage = {
    sender : Text;
    audioData : Text; // Base64 encoded audio
    timestamp : Nat;
  };

  type Room = {
    participants : List.List<Text>;
    strokes : List.List<Stroke>;
    audioMessages : List.List<AudioMessage>;
  };

  let rooms = Map.empty<Text, Room>();

  // Room management
  public shared ({ caller }) func createRoom(roomName : Text) : async Text {
    let timeStamp = Time.now();
    let randomNum = timeStamp % 10000;
    let roomCode = (timeStamp + randomNum).toText();

    if (rooms.containsKey(roomCode)) {
      Runtime.trap("Room already exists");
    };

    let newRoom : Room = {
      participants = List.empty<Text>();
      strokes = List.empty<Stroke>();
      audioMessages = List.empty<AudioMessage>();
    };

    rooms.add(roomCode, newRoom);
    roomCode;
  };

  public shared ({ caller }) func joinRoom(roomCode : Text, user : Text) : async () {
    switch (rooms.get(roomCode)) {
      case (null) { Runtime.trap("Room does not exist") };
      case (?room) {
        room.participants.add(user);
      };
    };
  };

  // Drawing functionality
  public shared ({ caller }) func addStroke(roomCode : Text, stroke : Stroke) : async () {
    switch (rooms.get(roomCode)) {
      case (null) { Runtime.trap("Room does not exist") };
      case (?room) {
        room.strokes.add(stroke);
      };
    };
  };

  public query ({ caller }) func getStrokes(roomCode : Text) : async [Stroke] {
    switch (rooms.get(roomCode)) {
      case (null) { Runtime.trap("Room does not exist") };
      case (?room) {
        room.strokes.toArray();
      };
    };
  };

  // Audio messaging
  public shared ({ caller }) func addAudioMessage(roomCode : Text, message : AudioMessage) : async () {
    switch (rooms.get(roomCode)) {
      case (null) { Runtime.trap("Room does not exist") };
      case (?room) {
        room.audioMessages.add(message);
      };
    };
  };

  public query ({ caller }) func getAudioMessages(roomCode : Text) : async [AudioMessage] {
    switch (rooms.get(roomCode)) {
      case (null) { Runtime.trap("Room does not exist") };
      case (?room) {
        room.audioMessages.toArray();
      };
    };
  };

  public query ({ caller }) func getAllRoomCodes() : async [Text] {
    rooms.keys().toArray();
  };
};

