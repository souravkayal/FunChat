using Core.Model;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace ChatApp.Core
{
    public class ChatService
    {
        HubProxy ChatHub;

        public ChatService()
        {
            this.ChatHub = new HubProxy();
        }
        public List<User> GetAllInGroup(string RoomName)
        {
            var items = ChatHub.GetUsersInRoom(RoomName);
            return items;
        }

        public bool CheckRoomExist(string RoomName)
        {
            return ChatHub.GetAllGroups().Where(f => f == RoomName).Count() > 0 ? true : false; 
        }

        public List<string> GetAllGroup()
        {
            return ChatHub.GetAllGroups();
        }

        public List<Room> GetAllRoomsByOwner(string UserName)
        {
            var rooms = ChatHub.GetAllRooms().Where(f => f.Creator.Name == UserName).ToList();
            return rooms;
        }

    }
}
