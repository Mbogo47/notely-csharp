using System;

namespace server.Models;

public class NoteResponseDto
{
    public Guid Id { get; set; }
    public string Title { get; set; }
    public string Synopsis { get; set; }
    public string Content { get; set; }
    public bool IsDeleted { get; set; }
    public bool IsPublic { get; set; }
    public Guid AuthorId { get; set; }
    public AuthorDto Author { get; set; } 
}