using System;

namespace server.Models;

public class AuthorDto
{
    public Guid Id { get; set; } 
    public string UserName { get; set; }
    public string FirstName { get; set; }
    public string LastName { get; set; }
    public string EmailAddress { get; set; }
    public string? AvatarImage { get; set; }
}