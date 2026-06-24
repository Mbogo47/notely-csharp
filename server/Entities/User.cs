using System.ComponentModel.DataAnnotations;
using Microsoft.AspNetCore.Identity;

namespace Server.Entities;

public class User
{
    [Key]
    public Guid Id { get; set; } = Guid.NewGuid();
    public string UserName { get; set; } = string.Empty;  
    public string FirstName { get; set; } = string.Empty; 
    public string LastName { get; set; } = string.Empty;  
    public string EmailAddress { get; set; } = string.Empty; 
    public string? AvatarImage { get; set; }  
    public bool IsDeleted { get; set; } = false;
    public ICollection<Note> Notes { get; set; } = new List<Note>();
}