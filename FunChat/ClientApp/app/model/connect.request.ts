import { User, ChatMessage } from './chat.model';


export class ConnectRequest
{
    public Room : string
    public ConnectionId: string
    public UserName: string
    public PassCode : string

    public constructor(Room: string, ConnectionId: string, UserName:string, PassCode : string)
    {
        this.Room = Room;
        this.ConnectionId = ConnectionId;
        this.UserName = UserName;
        this.PassCode = PassCode;
    }
}

export class EventNotifier
{
    public CurrentUser : User
    public Message: string
    public PassCode: string
    public ActionType: string
    public RoomName : string
    public Users: User[]
}

export class DosconnectRequest 
{
    public Room: string;
    public ConnectionId: string;
    public UserName: string;
    public constructor(Room: string, ConnectionId: string, UserName:string)
    {
        this.Room = Room;
        this.ConnectionId = ConnectionId;
        this.UserName = UserName;
    }
}

export class ConnectionStatusChangeRequest
{
    public GroupName: string 
    public User: User 
    public constructor(GroupName: string, User: User)
    {
        this.GroupName = GroupName;
        this.User = User
    }
}

export class Room
{
    public RoomName: string;
    public Messages ?: ChatMessage[]
    public UnseenMessageCount: number
    public PassCode : string

    public constructor(RoomName: string, Messages: ChatMessage[], UnseenMessageCount: number , PassCode : string)
    {
        this.RoomName = RoomName;
        this.Messages = Messages;
        this.UnseenMessageCount = UnseenMessageCount;
        this.PassCode = PassCode;
    }
}

export class ChatProfile
{
    public ConnectionId: string;
    public Rooms: Room[];
    public UserName: string;

    public constructor(ConnectionId: string, Rooms: Room[], UserName: string)
    {
        this.ConnectionId = ConnectionId;
        this.Rooms = Rooms;
        this.UserName = UserName;
    }
}