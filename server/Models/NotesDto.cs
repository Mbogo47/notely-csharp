using System.ComponentModel.DataAnnotations;

namespace server.models;

public class NotesDto
{
    public Guid Id { get; set; } = Guid.NewGuid();
    public string Title { get; set; }
    public string Synopsis { get; set; }
    public string Content { get; set; }
    public bool IsDeleted { get; set; } = false;
    public bool IsPublic { get; set; } = true;
    public Guid AuthorId { get; set; }
    public UsersDto Author { get; set; }
    
}
