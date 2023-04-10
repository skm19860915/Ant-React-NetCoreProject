using Microsoft.AspNetCore.Identity;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace KitTracker.CustomProvider
{
    public class ApplicationUser: IdentityUser
    {
        public const string SystemUserId = "29910166-b30c-427a-89c6-e952f2b59a6e";
    }
}
