﻿namespace KitTracker.Entities
{
    public class AuthenticateResponse
    {
        public int id { get; set; }
        public string FirstName { get; set; }
        public string LastName { get; set; }
        public string Username { get; set; }
        public string JwtToken { get; set; }


    }
}
