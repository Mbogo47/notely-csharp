using System.ComponentModel.DataAnnotations;
using System.Text.Json.Serialization;

namespace server.models;

public class UsersDto
{
    public Guid Id { get; set; } = Guid.NewGuid();
    public string UserName { get; set; }
    public string FirstName { get; set; }
    public string LastName { get; set; }
    public string EmailAddress { get; set; }
    public string? AvatarImage { get; set; }
    public bool IsDeleted { get; set; } = false;
    public ICollection<NotesDto> Notes { get; set; }

}

public class AuthResponseDto
{
    public string Token { get; set; } = string.Empty;
    public UsersDto User { get; set; } = null!;
}