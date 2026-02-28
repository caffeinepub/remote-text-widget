import Map "mo:core/Map";
import List "mo:core/List";
import Text "mo:core/Text";

module {
  type OldActor = {
    pairingCodeToRecipient : Map.Map<Text, Text>;
    pairingCodeToMessage : Map.Map<Text, Text>;
  };

  type Stroke = {
    points : [(Float, Float)];
    color : Text;
    thickness : Float;
  };

  type AudioMessage = {
    sender : Text;
    audioData : Text;
    timestamp : Nat;
  };

  type Room = {
    participants : List.List<Text>;
    strokes : List.List<Stroke>;
    audioMessages : List.List<AudioMessage>;
  };

  type NewActor = {
    rooms : Map.Map<Text, Room>;
  };

  public func run(_old : OldActor) : NewActor {
    { rooms = Map.empty<Text, Room>() };
  };
};

