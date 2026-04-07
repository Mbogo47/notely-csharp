using System.Security.Claims;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using server.Data;
using Server.Entities;

namespace server.Services;

public class CurrentUserService : ICurrentUserService
{
    private readonly UserManager<IdentityUser> _userManager;
    private readonly AppDbContext _context;

    public CurrentUserService(UserManager<IdentityUser> userManager, AppDbContext context)
    {
        _userManager = userManager;
        _context = context;
    }

    public async Task<(User? appUser, IActionResult? error)> ResolveAsync(ClaimsPrincipal user)
    {
        var identityUserId = user.FindFirstValue(ClaimTypes.NameIdentifier)
                          ?? user.FindFirstValue("sub");

        if (identityUserId == null)
            return (null, new UnauthorizedObjectResult(new { message = "Invalid token." }));

        var identityUser = await _userManager.FindByIdAsync(identityUserId);
        if (identityUser == null)
            return (null, new NotFoundObjectResult(new { message = "User not found." }));

        var appUser = await _context.Users
            .FirstOrDefaultAsync(u => u.EmailAddress == identityUser.Email);

        if (appUser == null)
            return (null, new NotFoundObjectResult(new { message = "User profile not found." }));

        return (appUser, null);
    }
}