using System;

namespace server.Models;

public class CreateNoteDto
{
    public string Title { get; set; }
    public string Synopsis { get; set; }
    public string Content { get; set; }
    public bool IsPublic { get; set; } = true;
    public bool IsDeleted { get; set; } = false;
}
