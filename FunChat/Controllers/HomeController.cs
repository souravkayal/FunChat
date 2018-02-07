using System;
using System.Collections.Generic;
using System.Diagnostics;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore;
using Microsoft.AspNetCore.Http;

namespace ChatApp.Controllers
{

    public class UserWelcome
    {
        public string RoomName { get; set; }
        public string PassCode { get; set; }
        public string UserName { get; set; }
    }

    public class HomeController : Controller
    {

        public IActionResult Index()
        {
            return View("Welcome");
        }

        public ActionResult Room(UserWelcome Info)
        {
            ViewBag.Rooms = Info.RoomName;
            ViewBag.UserName = Info.UserName;
            ViewBag.PassCode = Info.PassCode;
            return View("Index");
        }

        public ActionResult SpaFallback()
        {
            var result = @ViewBag.Rooms;

            return View("Index");
        }

        public IActionResult Error()
        {
            ViewData["RequestId"] = Activity.Current?.Id ?? HttpContext.TraceIdentifier;
            return View();
        }
    }
}
