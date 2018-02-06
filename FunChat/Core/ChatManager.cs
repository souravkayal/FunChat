using Newtonsoft.Json;
using System;
using System.Collections.Generic;
using System.Text;

namespace Core.Model
{
    public class Room
    {
        public string RoomName { get; set; }
        public string Passcode { get; set; }
        public List<User> Users { get; set; }
    }

    public class User
    {
        public string Name { get; set; }
        public string ConnectionId { get; set; }
        public OnlineStatus OnlineStatus { get; set; }
    }

    public enum OnlineStatus
    {
        Online, Offline, Away, Busy
    }

    public class UserTypingNotification
    {
        public string RoomName { get; set; }
        public string UserName { get; set; }
    }

    //string GroupName, string ConnectionId, OnlineStatus CurrentStatus

    public class ConnectionStatusChangeRequest
    {
        public string GroupName { get; set; }
        public User User { get; set; }
    }


    public class ConnectRequest
    {
        [JsonProperty("Rooms")]
        public string[] Rooms { get; set; }

        [JsonProperty("ConnectionId")]
        public string ConnectionId { get; set; }

        [JsonProperty("UserName")]
        public string UserName { get; set; }
    }

    public class DisconnectRequest
    {
        [JsonProperty("Room")]
        public string Room { get; set; }

        [JsonProperty("ConnectionId")]
        public string ConnectionId { get; set; }

        [JsonProperty("UserName")]
        public string UserName { get; set; }
    }

    public class EventNotifier
    {
        public User CurrentUser { get; set; }
        public string Message { get; set; }
        public string ActionType { get; set; }
        public string Passcode { get; set; }
        public List<User> Users { get; set; }
    }

    public class ChatMessage
    {
        [JsonProperty("Message")]
        public string Message { get; set; }

        [JsonProperty("Sender")]
        public string Sender { get; set; }

        [JsonProperty("SenderConnectionId")]
        public string SenderConnectionId { get; set; }

        [JsonProperty("ToGroup")]
        public string ToGroup { get; set; }

        [JsonProperty("SendTime")]
        public string SendTime { get; set; }
    }

}
