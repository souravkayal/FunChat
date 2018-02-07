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
            var user = new User { ConnectionId = Context.ConnectionId, Name = Request.UserName, OnlineStatus = OnlineStatus.Online };
            var passCode = Guid.NewGuid().ToString().Replace("-", string.Empty).Substring(0, 4).ToUpper();
            //foreach (var item in Request.Rooms)
            //{
                bool isPresent = false;

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
                        isPresent = true;
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
                        Users = new List<User> { user }
                    });
                }

                //Group Not present : Send notification only to first Connected User
                if(!isPresent)
                {
                    await Groups.AddAsync(Context.ConnectionId, Request.Room);
                    await Clients.Group(Request.Room).InvokeAsync("userEvent", new EventNotifier
                        {
                            CurrentUser = user,
                            Message = ": join in chat!",
                            ActionType = "Connect",
                            PassCode = _rooms[Request.Room].PassCode,
                            RoomName = Request.Room,
                            Users = _rooms[Request.Room].Users
                        });
                }
            //}
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

                    //notify group then
                    await Clients.Group(Request.Room).InvokeAsync("userEvent",
                    new EventNotifier
                    {
                        CurrentUser = new User { Name = Request.UserName, ConnectionId = Context.ConnectionId },
                        Message = ": left from chat!",
                        ActionType = "Disconnect",
                        Users = group.Users.Where(f => f.ConnectionId != Request.ConnectionId).ToList()
                    });

                    //notify user @ first.
                    await Clients.Client(Request.ConnectionId).InvokeAsync("notifyUser",
                      new EventNotifier
                      {
                          Message = "You left the room",
                          ActionType = "Disconnect"
                      }
                    );

                    group.Users.RemoveAll((x) => x.ConnectionId == Request.ConnectionId && x.Name == Request.UserName);
                    //remove user from SignalR group
                    await Groups.RemoveAsync(Context.ConnectionId, Request.Room);
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
                        Users = _rooms[Request.GroupName].Users
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

    }
}
