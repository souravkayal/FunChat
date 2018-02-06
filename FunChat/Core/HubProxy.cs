using Core.Model;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace ChatApp.Core
{
    public class HubProxy : ChatHub
    {
        public List<string> GetAllGroups()
        {
            return _rooms.Keys.ToList();
        }

        public List<User> GetUsersInRoom(string RoomName)
        {
            return _rooms[RoomName].Users;
        }


    }
}
