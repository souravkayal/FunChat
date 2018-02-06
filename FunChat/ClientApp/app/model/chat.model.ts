export class User
{
    Name: string
    ConnectionId: string
    OnlineStatus : OnlineStatus
    constructor(Name: string, ConnectionId : string , OnlineStatus : OnlineStatus)
    {
        this.Name = Name;
        this.ConnectionId = ConnectionId;
        this.OnlineStatus = OnlineStatus;
    }
}

export class UserTypingNotification
{
    UserName :string
    RoomName : string
}


export enum OnlineStatus {
    Online, Offline, Away, Busy
}

export class ChatMessage
{
    Message: string
    Sender: string
    SenderConnectionId: string
    ToGroup: string
    SendTime: string
    isViewed: boolean;

    constructor(Message: string, Sender: string, SenderConnectionId: string, ToGroup: string, SendTime : string)
    {
        this.Message = Message;
        this.Sender = Sender;
        this.SenderConnectionId = SenderConnectionId;
        this.ToGroup = ToGroup;
        this.SendTime = SendTime;
        this.isViewed = false;
    }
}

