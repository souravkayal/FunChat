using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.SignalR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Collections.Concurrent;
using Newtonsoft.Json;
using Core.Model;

namespace ChatApp.Core
{
    public class ChatHub : Hub 
    {
        //String: Room name - Room info
        protected static ConcurrentDictionary<string, Room> _rooms = new ConcurrentDictionary<string, Room>();

        public override async Task OnConnectedAsync()
        {
        }
        public async Task ConnectMe(ConnectRequest Request)
        {
            var ConnectionId = Context.ConnectionId;
            var user = new User { ConnectionId = ConnectionId, Name = Request.UserName, OnlineStatus = OnlineStatus.Online };
            var passCode = Guid.NewGuid().ToString().Replace("-", string.Empty).Substring(0, 4).ToUpper();
            //foreach (var item in Request.Rooms)
            //{
                bool isUserPresentInRoom = false;

                if (_rooms.ContainsKey(Request.Room)) //Room is there -so add user in group
                {
                    var users = _rooms[Request.Room].Users;
                    if (users.Where(f => f.ConnectionId == Request.ConnectionId).Count() == 0) //check for refresh needed
                        
                        //Check passcode here
                        if(Request.PassCode == _rooms[Request.Room].PassCode)
                            users.Add(user);
                        else
                        {
                            //invalid passcode to join room

                        }
                    else
                    {
                        isUserPresentInRoom = true;
                        await Clients.Client(Request.ConnectionId).InvokeAsync("notifyUser", new EventNotifier
                        {
                            Message = "You are already connected in "+ Request.Room + " group !",
                            ActionType = "AlreadyConnected"
                        });
                    }
                }
                else //Room not there - create room and add current user
                {
                    _rooms.TryAdd(Request.Room, new Room
                    {
                        RoomName = Request.Room,
                        PassCode = passCode,
                        Users = new List<User> { user },
                        Creator = user
                    });
                }

                //Group Not present : Send notification only to first Connected User
                if(!isUserPresentInRoom)
                {
                    //Inform other in group
                    await Clients.Group(Request.Room).InvokeAsync("userEvent", new EventNotifier
                    {
                        Message = user.Name + " join in chat!",
                        ActionType = "Connected",
                        Users = _rooms[Request.Room].Users
                    });

                    //Add user in room, if room not present SignalR will create new one and Add
                    await Groups.AddAsync(ConnectionId, Request.Room);

                    //send connection Id and room name to new join user
                    await Clients.Client(ConnectionId).InvokeAsync("notifyUser",
                          new EventNotifier
                          {
                              Message = "You Join in " + Request.Room + " room",
                              ActionType = "Connected",
                              PassCode = _rooms[Request.Room].PassCode,
                              RoomName = Request.Room,
                              Users = _rooms[Request.Room].Users,
                              CurrentUser = user
                          }
                        );
            }
        }
        public async Task DisconnectMe(DisconnectRequest Request)
        {
            //check whether user is connected or not in that Room
            if (_rooms.ContainsKey(Request.Room))
            {
                var group = _rooms[Request.Room];
                //check whether user's connection id is there or not, if there remove
                if (group.Users.Where(f => f.ConnectionId == Request.ConnectionId).Count() > 0)
                {
                    //notify user @ first.
                    await Clients.Client(Request.ConnectionId).InvokeAsync("notifyUser",
                      new EventNotifier
                      {
                          Message = "You left from room " + Request.Room,
                          ActionType = "Disconnect"
                      }
                    );

                    //remove user from SignalR group
                    await Groups.RemoveAsync(Context.ConnectionId, Request.Room);

                    //remove user from in memory store
                    group.Users.RemoveAll((x) => x.ConnectionId == Request.ConnectionId && x.Name == Request.UserName);

                    //notify other member in group 
                    await Clients.Group(Request.Room).InvokeAsync("userEvent",
                    new EventNotifier
                    {
                        CurrentUser = new User { Name = Request.UserName, ConnectionId = Context.ConnectionId },
                        Message = Request.UserName + " : left from " + Request.Room  + "room",
                        ActionType = "Disconnect",
                        Users = group.Users.Where(f => f.ConnectionId != Request.ConnectionId).ToList(),
                        //PassCode = _rooms[Request.Room].PassCode,
                        //RoomName = Request.Room,
                    });
                }
            }
        }
        public async Task ChangeStatus(ConnectionStatusChangeRequest Request)
        {
            if (_rooms.ContainsKey(Request.GroupName))
            {
                var user = _rooms[Request.GroupName].Users.Where(f => f.ConnectionId == Request.User.ConnectionId).FirstOrDefault();
                if (user != null)
                    user.OnlineStatus = Request.User.OnlineStatus;

                //send notification to all member of the group
                await Clients.Group(Request.GroupName).InvokeAsync("userEvent",
                    new EventNotifier
                    {
                        CurrentUser = new User { ConnectionId = Context.ConnectionId, Name = Request.User.Name },
                        Message = " went to " + Request.User.OnlineStatus.ToString(),
                        ActionType = "StatusChange",
                        Users = _rooms[Request.GroupName].Users,
                        RoomName = Request.GroupName
                    });
            }
        }
        public override async Task OnDisconnectedAsync(Exception ex)
        {
            //await Clients.All.InvokeAsync("sendClient", $"{ _OpenRoom[Context.ConnectionId] }: left");
        }
        public async Task Send(ChatMessage Message)
        {
            await Clients.Group(Message.ToGroup).InvokeAsync("sendClient", 
                new ChatMessage
                {   Message = Message.Message,
                    Sender = Message.Sender,
                    ToGroup = Message.ToGroup,
                    SenderConnectionId = Message.SenderConnectionId,
                    SendTime = DateTime.Now.ToLongTimeString()
                });
        }
        public async Task TypeNofification(string Name, string Room)
        {
            await Clients.Group(Room).InvokeAsync("userTyping",
                new UserTypingNotification
                {
                    UserName = Name,
                    RoomName = Room
                });
        }

        public async Task DeleteRoom(string Room, string UserName)
        {
            if(_rooms.ContainsKey(Room))
            {
                Room deletedRoom = null;
                _rooms.TryRemove(Room, out deletedRoom);

                //Once room is deleted send notification to all member of the room.
                await Clients.Group(Room).InvokeAsync("notifyUser",
                    new EventNotifier
                    {
                        CurrentUser = new User { Name = UserName, ConnectionId = Context.ConnectionId },
                        Message = UserName + " : has deleted " + Room + "room",
                        ActionType = "RoomDeleted",
                    });
            }
        }

    }
}
