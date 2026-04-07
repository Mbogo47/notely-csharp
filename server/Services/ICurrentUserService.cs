using System;
using System.Security.Claims;
using Microsoft.AspNetCore.Mvc;
using Server.Entities;

namespace server.Services;

// ICurrentUserService.cs
public interface ICurrentUserService
{
    Task<(User? appUser, IActionResult? error)> ResolveAsync(ClaimsPrincipal user);
}
