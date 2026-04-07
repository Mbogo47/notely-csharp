using System;
using System.ComponentModel.DataAnnotations;

namespace Server.Entities;

public class Note
{[Key]
    public Guid Id { get; set; } = Guid.NewGuid();
    public string Title { get; set; } = string.Empty;    
    public string Synopsis { get; set; } = string.Empty; 
    public string Content { get; set; } = string.Empty;  
    public bool IsDeleted { get; set; } = false;
    public bool IsPublic { get; set; } = true;
    public Guid AuthorId { get; set; }
    public User Author { get; set; } = null!;
}