using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using server.models;
using Server.Entities;
using Server.models;
using Microsoft.AspNetCore.Identity;
using server.Data;
using server.Models;
using Microsoft.EntityFrameworkCore;
using server.Services;

namespace server.controllers
{
    [Route("api")]
    [ApiController]
    public class AuthControllers : ControllerBase
    {
        private readonly UserManager<IdentityUser> _userManager;
        private readonly AppDbContext _context;
        private readonly TokenService _tokenService;
       
        public AuthControllers(
            UserManager<IdentityUser> userManager,
            AppDbContext context,
            TokenService tokenService)
        {
            _userManager = userManager;
            _context = context;
            _tokenService = tokenService;
           ;

        }

        [HttpPost("auth/register")]
        public async Task<ActionResult<UsersDto>> Register([FromBody] RegisterDto registerDto)
        {
            // 1. Check if username or email already exists
            if (await _userManager.FindByNameAsync(registerDto.UserName) != null)
                return Conflict(new { message = "Username is already taken." });

            if (await _userManager.FindByEmailAsync(registerDto.Email) != null)
                return Conflict(new { message = "Email is already registered." });

            // 2. Create the Identity user (handles password hashing)
            var identityUser = new IdentityUser
            {
                UserName = registerDto.UserName,
                Email = registerDto.Email
            };

            var result = await _userManager.CreateAsync(identityUser, registerDto.Password);

            if (!result.Succeeded)
            {
                await _userManager.DeleteAsync(identityUser);
                return StatusCode(500, "Failed to save user profile.");
            }

            // 3. Create the application user (for additional profile data)
            var appUser = new User
            {
                UserName = registerDto.UserName,
                FirstName = registerDto.FirstName,
                LastName = registerDto.LastName,
                EmailAddress = registerDto.Email
            };

            _context.AppUsers.Add(appUser);
            await _context.SaveChangesAsync();

            // 4. Map to DTO and return
            var userDto = new UsersDto
            {
                Id = appUser.Id,
                UserName = appUser.UserName,
                FirstName = appUser.FirstName,
                LastName = appUser.LastName,
                EmailAddress = appUser.EmailAddress,
                AvatarImage = appUser.AvatarImage,
                IsDeleted = appUser.IsDeleted,
                Notes = new List<NotesDto>()
            };

            return CreatedAtAction(nameof(Register), new { id = userDto.Id }, userDto);
        }

        [HttpPost("auth/login")]
        public async Task<ActionResult<UsersDto>> Login([FromBody] LoginDto loginDto)
        {
            // 1. Check whether the username or email exists
            var user = await _userManager.FindByNameAsync(loginDto.Identifier)
                    ?? await _userManager.FindByEmailAsync(loginDto.Identifier);

            if (user == null)
                return Unauthorized(new { message = "Invalid username or email." });

            // 2. Verify the password
            if (!await _userManager.CheckPasswordAsync(user, loginDto.Password))
                return Unauthorized(new { message = "Invalid Password." });

            // 3. Find the app user profile
           var appUser = await _context.AppUsers
    .FirstOrDefaultAsync(u => u.EmailAddress == user.Email || u.UserName == user.UserName);

            // 4. Generate token
            var token = _tokenService.GenerateToken(user);

            // 5. Return user + token
            return Ok(new AuthResponseDto
            {
                Token = token,
                User = new UsersDto
                {
                    Id = appUser!.Id,
                    UserName = user.UserName!,
                    FirstName = appUser.FirstName,
                    LastName = appUser.LastName,
                    EmailAddress = appUser.EmailAddress,
                    AvatarImage = appUser.AvatarImage,
                    IsDeleted = appUser.IsDeleted,
                    Notes = new List<NotesDto>()
                }
            });
        }


       
    }
}
