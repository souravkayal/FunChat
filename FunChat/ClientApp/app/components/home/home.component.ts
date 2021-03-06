import { Component, OnInit, ElementRef, ViewChild, AfterViewChecked, ViewContainerRef, OnDestroy  } from '@angular/core';
import { HubConnection } from '@aspnet/signalr-client';
import { ConnectRequest, DosconnectRequest, EventNotifier, ConnectionStatusChangeRequest , ChatProfile , Room } from '../../model/connect.request';
import { chatService } from '../../service/chat.service'
import { User, ChatMessage, OnlineStatus, UserTypingNotification } from '../../model/chat.model'
import { BrowserModule } from '@angular/platform-browser';
import { CoolLocalStorage } from 'angular2-cool-storage';
import { Renderer } from '@angular/core';
import { ToastsManager } from 'ng2-toastr/ng2-toastr';
import { FormsModule, ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';

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
    roomOwnByUser: string[];


    public createRoomForm = this.fb.group({
        RoomName: ['']
    });

    constructor(private chatService: chatService, localStorage: CoolLocalStorage, private render: Renderer, private toastr: ToastsManager, public fb: FormBuilder)
    {
        this.localStorage = localStorage; 
        this.chatProfile = this.localStorage.getObject("UserProfile");
    }


    public sendMessage(): void {
        this.hubConnection.invoke('Send', new ChatMessage(this.message, this.chatProfile.UserName , this.connectionId, this.currentRoom,""));
        this.message = "";
    }

    //function to get all rooms created by current user
    public getAllCreatedRoom(userName : string): void {
        this.chatService.GetAllRoomsByOwner(userName).subscribe(rooms => {

            this.roomOwnByUser = [];
            this.roomOwnByUser = rooms;
        });
    }

    //get all rooms where the user is already join.
    public createNewRoom(flag : string): void {

        //Check whether group exist.
        this.chatService.checkGroupExist(this.createRoomForm.value.RoomName).subscribe(result => {
            if (result == false) {
                if (flag == 'Create') {
                }
                if (flag == 'CreateAndJoin') {
                    this.hubConnection.invoke("ConnectMe", new ConnectRequest(this.createRoomForm.value.RoomName, this.connectionId, this.chatProfile.UserName, ""));
                }
            } else
                this.toastr.warning("The Group Name already exist", 'Message');
        })
        
    }


    //Get all members in  current room
    public getAllMemberInRoom(): void {
        this.chatService.getUserInGroup(this.currentRoom).subscribe(users => {
            this.usersInRoom = [];
            if (users.length > 0) {
                this.usersInRoom = users;
            }
         });
    }

    //Change chat room
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

    public disconnectMe(): boolean {
        this.hubConnection.invoke('DisconnectMe', new DosconnectRequest(this.currentRoom , this.connectionId, this.chatProfile.UserName));
        return false;
    }

    public changeOnlineStatus(OnlineStatus: OnlineStatus): boolean {
        this.hubConnection.invoke("ChangeStatus", new ConnectionStatusChangeRequest(this.currentRoom, new User(this.chatProfile.UserName, this.connectionId, OnlineStatus)));
        return false;
    }

    public notifyRoom() {
        this.hubConnection.invoke("TypeNofification", this.chatProfile.UserName, this.currentRoom);
    }

    public deleteRoom(roomName :string) {
        this.hubConnection.invoke("DeleteRoom", roomName , this.chatProfile.UserName);
        return false;
    }



    ngOnInit() {
        this.hubConnection = new HubConnection('/chat');

        this.hubConnection.on('userEvent', (data: EventNotifier) => {
            this.usersInRoom = [];
            this.usersInRoom = data.Users;
            //this.toastr.success(data.Message, 'Message');
            //(this.localStorage.getObject("UserProfile") as ChatProfile).ConnectionId = this.connectionId;
        });

        this.hubConnection.on('notifyUser', (data: EventNotifier) => {
            
            if (data.ActionType == "Connected") {
                this.passCode = data.PassCode;
                this.currentRoom = data.RoomName;
                this.usersInRoom = [];
                this.usersInRoom = data.Users;
                this.connectionId = data.CurrentUser.ConnectionId;

                //If room name is there then user came from welcome page
                if (Object.keys(this.chatProfile.Rooms.filter(x => x.RoomName == data.RoomName)).length > 0)
                {
                    this.chatProfile.Rooms.filter(f => f.RoomName == data.RoomName)[0].PassCode = data.PassCode;
                }
                //room not there so, user created room in chat home
                else {
                    this.chatProfile.Rooms.push(new Room(data.RoomName, [], 0, data.PassCode));
                    this.getAllCreatedRoom(data.CurrentUser.Name);
                }
                this.toastr.warning(data.Message, 'Message');
            }

            if (data.ActionType == "Disconnect" || data.ActionType == "RoomDeleted") {
                //remove current room/group from chat profile
                this.chatProfile.Rooms.splice(this.chatProfile.Rooms.findIndex(f => f.RoomName == this.currentRoom), 1);
                //Remove all users in that room
                this.usersInRoom = [];
                //remove chat history from message archive ?? not needed if user came back in same session
                this.messages = [];
                //update local storage with new profile
                this.localStorage.setObject("UserProfile", this.chatProfile);
                this.toastr.warning(data.Message, 'Message');
                
                if (this.chatProfile.UserName == data.CurrentUser.Name)
                    this.getAllCreatedRoom(this.chatProfile.UserName);
            }

            if (data.ActionType == "RoomDeleteNotAllowed") {
                this.toastr.warning(data.Message, 'Message');
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

            if (notification.RoomName == this.currentRoom) {
                this.typeNotify = notification.UserName + " is typing..."
                setTimeout(() => {
                    this.typeNotify = "";
                }, 1000);
            }
        });

        this.hubConnection.start()
            .then(() => {
                this.hubConnection.invoke("ConnectMe", new ConnectRequest(this.chatProfile.Rooms[0].RoomName, this.connectionId, this.chatProfile.UserName, this.chatProfile.Rooms[0].PassCode)).
                    then(() => {
                        this.getAllCreatedRoom(this.chatProfile.UserName);
                    })
            })
            .catch(err => {
                console.log('Error while establishing connection:' + err);
            });

        this.scrollToBottom();
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
 