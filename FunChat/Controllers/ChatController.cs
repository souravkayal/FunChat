using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Core.Model;
using ChatApp.Core;

namespace ChatApp.Controllers
{
    [Produces("application/json")]
    [Route("api/Chat")]
    public class ChatController : Controller
    {
        ChatService ChatService;
        public ChatController()
        {
            this.ChatService = new ChatService();
        }

        [Route("checkRoomExist")]
        public Boolean CheckRoomExist(string RoomName)
        {
            return ChatService.CheckRoomExist(RoomName);
        }


        [Route("getAllGroup")]

        public List<string> GetAllGroups()
        {
            return ChatService.GetAllGroup();
        }

        [Route("getAllInGroup/{GroupName}")]
        public List<User> GetAllInGroup(string GroupName)
        {
            return ChatService.GetAllInGroup(GroupName);
        }
    }
}