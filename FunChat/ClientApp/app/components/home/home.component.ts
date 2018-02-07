import { Component, OnInit, ElementRef, ViewChild, AfterViewChecked, ViewContainerRef, OnDestroy  } from '@angular/core';
import { HubConnection } from '@aspnet/signalr-client';
import { ConnectRequest, DosconnectRequest, EventNotifier, ConnectionStatusChangeRequest , ChatProfile , Room } from '../../model/connect.request';
import { chatService } from '../../service/chat.service'
import { User, ChatMessage, OnlineStatus, UserTypingNotification } from '../../model/chat.model'
import { BrowserModule } from '@angular/platform-browser';
import { CoolLocalStorage } from 'angular2-cool-storage';
//import { ToastrService } from 'ngx-toastr';
import { Renderer } from '@angular/core';
import { ToastsManager } from 'ng2-toastr/ng2-toastr';


@Component({
    selector: 'home',
    templateUrl: './home.component.html',
    styleUrls: ['./home.component.css'],
    providers: [chatService] 
})
export class HomeComponent implements OnInit  {

    public hubConnection: HubConnection;
    public async: any;
    public message = '';
    public typeNotify : string= "";
    public messages: ChatMessage[] = [];
    public messagesStore: ChatMessage[] = [];
    public usersInRoom: User[] = [];
     
    @ViewChild('scrollMe') private myScrollContainer: ElementRef;
    public currentRoom: string; //current selected room
    public connectionId: string; //current user connection id
    public connectRequest: ConnectRequest; //current user connection object
    
    public newroom: string;
    public availableRooms: string[];
    OnlineStatus: typeof OnlineStatus = OnlineStatus;
    localStorage: CoolLocalStorage;
    chatProfile: ChatProfile;
    public selectedItem: any;
    public passCode: string;

    // private toastr: ToastrService
    constructor(private chatService: chatService, localStorage: CoolLocalStorage, private render: Renderer, public toastr: ToastsManager, vcr: ViewContainerRef)
    {
        this.localStorage = localStorage; 
        this.chatProfile = this.localStorage.getObject("UserProfile");
        this.toastr.setRootViewContainerRef(vcr);
    }


    public sendMessage(): void {
        this.hubConnection.invoke('Send', new ChatMessage(this.message, this.chatProfile.UserName , this.connectionId, this.currentRoom,""));
        this.message = "";
    }

    public getAllRooms(): void {
        this.chatService.getAllGroup().subscribe(groups => {
            //this.availableRooms = [];
            //this.availableRooms = groups;
        });
    }

    public createNewRoom(createRoom: any): void {
        var Newroom : string[] = [createRoom.value ];
        //--TODO : Check whether group exist.
        this.chatService.checkGroupExist(createRoom.value).subscribe(result => {
            if (result == false) {
                //connectMe function will create new Group and add user there.

                //this.hubConnection.invoke("ConnectMe", new ConnectRequest(Newroom, this.connectionId, this.chatProfile.UserName));
                //this.chatProfile.Rooms.push(new Room(createRoom.value, [], 0));

                this.selectedItem = createRoom.value;
                this.currentRoom = createRoom.value;

            } else
                alert("The Group Name already exist");
        })
        
    }



    public getAllMemberInRoom(): void {
        this.chatService.getUserInGroup(this.currentRoom).subscribe(users => {
            this.usersInRoom = [];
            if (users.length > 0) {
                this.usersInRoom = users;
            }
         });
    }

    public changeCharRoom(value: string, event: any): void {
        this.currentRoom = value;
        //pull all member in that room 
        this.getAllMemberInRoom();
        //filter out messages for current room
        this.messages = [];
        this.messages = this.messagesStore.filter(f => f.ToGroup == this.currentRoom);
        //reset unread message count
        this.chatProfile.Rooms.filter(f => f.RoomName == value)[0].UnseenMessageCount = 0;
        //this.render.setElementClass(event.target, "active", true);
        this.selectedItem = value;

    }

    public disconnectMe(): void {
        this.hubConnection.invoke('DisconnectMe', new DosconnectRequest(this.currentRoom , this.connectionId, this.chatProfile.UserName));
    }

    public changeOnlineStatus(OnlineStatus: OnlineStatus): void {
        this.hubConnection.invoke("ChangeStatus", new ConnectionStatusChangeRequest(this.currentRoom, new User(this.chatProfile.UserName, this.connectionId, OnlineStatus)));
    }

    public notifyRoom() {
        this.hubConnection.invoke("TypeNofification", this.chatProfile.UserName, this.currentRoom);
    }

    ngOnInit() {
        this.hubConnection = new HubConnection('/chat');

        this.hubConnection.on('userEvent', (data: EventNotifier) => {
            this.usersInRoom = [];
            this.usersInRoom = data.Users;
            this.connectionId = data.CurrentUser.ConnectionId;

            //Passcode will display only for current room
            this.passCode = data.PassCode;
            this.currentRoom = data.RoomName;
            this.toastr.success('You' + data.Message, 'Success!', );
            //(this.localStorage.getObject("UserProfile") as ChatProfile).ConnectionId = this.connectionId;
        });

        this.hubConnection.on('notifyUser', (data: EventNotifier) => {
            alert(data.Message);
            if (data.ActionType == "Disconnect") {
                //remove current group from chat profile
                this.chatProfile.Rooms.splice(this.chatProfile.Rooms.findIndex(f => f.RoomName == this.currentRoom), 1);
                //Remove all users in that room
                this.usersInRoom = [];
                //remove chat history from message archive ?? not needed if user came back in same session
                this.messages = [];
                //update local storage with new profile
                this.localStorage.setObject("UserProfile", this.chatProfile);
            }
        });

        this.hubConnection.on('sendClient', (messageItem: ChatMessage) => {
            this.messagesStore.push(messageItem);
            if (messageItem.ToGroup == this.currentRoom) {
                //push to message store and current message list 
                this.messages.push(messageItem);
            } else {
                //increase message count of that Room
                this.chatProfile.Rooms.filter(f => f.RoomName === messageItem.ToGroup)[0].UnseenMessageCount = 1;
            }
        });

        this.hubConnection.on('userTyping', (notification: UserTypingNotification) => {
            this.typeNotify = notification.UserName + " is typing..."
            setTimeout(() => {
                this.typeNotify = "";
            },1000);
        });

        this.hubConnection.start()
            .then(() => {
                this.hubConnection.invoke("ConnectMe", new ConnectRequest(this.chatProfile.Rooms[0].RoomName , this.connectionId, this.chatProfile.UserName, this.chatProfile.Rooms[0].PassCode));
                console.log('Hub connection started');
            })
            .catch(err => {
                console.log('Error while establishing connection:' + err);
            });

        this.scrollToBottom();
        //this.getAllRooms();
    }

    ngAfterViewChecked() {
        this.scrollToBottom();
    } 

    scrollToBottom(): void {
        try {
            this.myScrollContainer.nativeElement.scrollTop = this.myScrollContainer.nativeElement.scrollHeight;
        } catch (err) { }
    }
}
 