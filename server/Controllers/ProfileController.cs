using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using System.Security.Claims;
using server.Data;
using server.Models;
using server.Services;
using server.models;

namespace server.Controllers
{
    [Route("api")]
    [ApiController]
    [Authorize] // ← all endpoints in this controller require a valid JWT
    public class ProfileController : ControllerBase
    {
        private readonly AppDbContext _context;
        private readonly ICurrentUserService _currentUser;
        private readonly UserManager<IdentityUser> _userManager;
        private readonly CloudinaryService _cloudinaryService;

        public ProfileController(
            ICurrentUserService currentUserService,
            CloudinaryService cloudinaryService,
            AppDbContext context,
            UserManager<IdentityUser> userManager
            )
        {
            _cloudinaryService = cloudinaryService;
            _currentUser = currentUserService;
            _context = context;
            _userManager = userManager;

        }

        [HttpGet("user")]
        public async Task<ActionResult<UsersDto>> GetProfile()
        {
            // Check if User is authenticated and resolve their profile
            var (appUser, error) = await _currentUser.ResolveAsync(User);
            if (error != null) return new ActionResult<UsersDto>((ActionResult)error);

            // 4. Return profile data
            return Ok(new UsersDto
            {
                Id = appUser.Id,
                UserName = appUser.UserName,
                FirstName = appUser.FirstName,
                LastName = appUser.LastName,
                EmailAddress = appUser.EmailAddress,
                AvatarImage = appUser.AvatarImage,
                IsDeleted = appUser.IsDeleted,
                Notes = new List<NotesDto>()
            });
        }



        // Uodate Password Endpoint
        [HttpPatch("password")]
        public async Task<IActionResult> ChangePassword([FromBody] UpdatePasswordDto changePasswordDto)
        {
            try
            {
                var (appUser, error) = await _currentUser.ResolveAsync(User);
                if (error != null) return error;

                // Fetch the IdentityUser — ChangePasswordAsync requires it
                var identityUser = await _userManager.FindByEmailAsync(appUser.EmailAddress);
                if (identityUser == null)
                    return NotFound(new { error = "Identity user not found." });

                var result = await _userManager.ChangePasswordAsync(
                    identityUser,
                    changePasswordDto.CurrentPassword,
                    changePasswordDto.NewPassword
                );

                if (!result.Succeeded)
                {
                    var errors = result.Errors.Select(e => e.Description);
                    return BadRequest(new { errors });
                }

                return Ok(new { message = "Password changed successfully." });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { error = $"An error occurred: {ex.Message}" });
            }
        }

        // Update User profile endpoint
        [HttpPut("profile")]
        public async Task<IActionResult> UpdateProfile([FromForm] UpdateUserDto updateProfileDto)
        {
            try
            {
                // 1. Resolve the current user
                var (appUser, error) = await _currentUser.ResolveAsync(User);
                if (error != null) return error;

                // 2. Update profile fields (only if provided)
                if (!string.IsNullOrEmpty(updateProfileDto.FirstName))
                    appUser.FirstName = updateProfileDto.FirstName;

                if (!string.IsNullOrEmpty(updateProfileDto.LastName))
                    appUser.LastName = updateProfileDto.LastName;

                // 3. Handle avatar upload with Cloudinary
                if (updateProfileDto.AvatarImage != null && updateProfileDto.AvatarImage.Length > 0)
                {
                    try
                    {
                        // Validate file type
                        var allowedExtensions = new[] { ".jpg", ".jpeg", ".png", ".gif", ".webp" };
                        var fileExtension = Path.GetExtension(updateProfileDto.AvatarImage.FileName).ToLowerInvariant();

                        if (!allowedExtensions.Contains(fileExtension))
                        {
                            return BadRequest(new { error = "Invalid file type. Only images are allowed (jpg, jpeg, png, gif, webp)." });
                        }

                        // Validate file size (max 5MB)
                        if (updateProfileDto.AvatarImage.Length > 5 * 1024 * 1024)
                        {
                            return BadRequest(new { error = "File size exceeds 5MB limit." });
                        }

                        // Upload new avatar using your CloudinaryService
                        var avatarUrl = await _cloudinaryService.UploadImageAsync(updateProfileDto.AvatarImage);
                        appUser.AvatarImage = avatarUrl;
                        _context.Update(appUser);
await _context.SaveChangesAsync();
                    }
                    catch (Exception ex)
                    {
                        return StatusCode(500, new { error = $"Failed to upload avatar: {ex.Message}" });
                    }
                }

                // 4. Save changes to the database
                await _context.SaveChangesAsync();

                Console.WriteLine(updateProfileDto.AvatarImage?.FileName ?? "NULL FILE");
                // 5. Return updated user data
                return Ok(new
                {
                    id = appUser.Id,
                    firstName = appUser.FirstName,
                    lastName = appUser.LastName,
                    emailAddress = appUser.EmailAddress,
                    userName = appUser.UserName,
                    avatarImage = appUser.AvatarImage
                });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { error = $"An error occurred while updating profile: {ex.Message}" });
            }
        }

    }
}