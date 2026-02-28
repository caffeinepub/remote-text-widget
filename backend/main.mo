import Text "mo:core/Text";
import Map "mo:core/Map";
import Runtime "mo:core/Runtime";
import Iter "mo:core/Iter";
import Array "mo:core/Array";
import Migration "migration";

(with migration = Migration.run)
actor {
  // Store recipients and messages by pairing code
  let pairingCodeToRecipient = Map.empty<Text, Text>();
  let pairingCodeToMessage = Map.empty<Text, Text>();

  public shared ({ caller }) func createPairingCode(pairingCode : Text) : async () {
    if (pairingCodeToRecipient.containsKey(pairingCode)) {
      Runtime.trap("Pairing code already exists");
    };
    pairingCodeToRecipient.add(pairingCode, "");
    pairingCodeToMessage.add(pairingCode, "");
  };

  public shared ({ caller }) func registerRecipient(pairingCode : Text, recipient : Text) : async () {
    if (not pairingCodeToRecipient.containsKey(pairingCode)) {
      Runtime.trap("Pairing code does not exist");
    };
    pairingCodeToRecipient.add(pairingCode, recipient);
  };

  public shared ({ caller }) func sendMessage(pairingCode : Text, message : Text) : async () {
    switch (pairingCodeToRecipient.get(pairingCode)) {
      case (null) {
        Runtime.trap("Pairing code does not exist");
      };
      case (?(_)) {
        pairingCodeToMessage.add(pairingCode, message);
      };
    };
  };

  public query ({ caller }) func pollMessage(pairingCode : Text) : async Text {
    switch (pairingCodeToMessage.get(pairingCode)) {
      case (null) {
        Runtime.trap("Pairing code does not exist");
      };
      case (?message) { message };
    };
  };

  public query ({ caller }) func getAllPairingCodes() : async [Text] {
    pairingCodeToRecipient.keys().toArray();
  };
};
