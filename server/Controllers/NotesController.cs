using System.Runtime.CompilerServices;
using System.Security.Claims;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using server.Data;
using server.models;
using server.Models;
using server.Services;
using Server.Entities;

namespace server.Controllers
{
    [Route("api")]
    [ApiController]
    [Authorize]
    public class NotesController : ControllerBase
    {
        private readonly ICurrentUserService _currentUser;
        private readonly AppDbContext _context;

        public NotesController(
            ICurrentUserService currentUserService,
            AppDbContext context)
        {
            _currentUser = currentUserService;
            _context = context;
        }

        [HttpGet("notes")]
        public async Task<IActionResult> GetNotes()
        {

            // Check if User is authenticated and resolve their profile
            var (appUser, error) = await _currentUser.ResolveAsync(User);
            if (error != null) return error;

            // Get all notes (maybe filter by IsPublic if needed)
            var notes = await _context.Notes
                .Include(n => n.Author)
                .Where(n => n.IsDeleted == false && n.IsPublic == true)
                .ToListAsync();

            // Map to DTOs
            var noteResponses = notes.Select(note => new NoteResponseDto
            {
                Id = note.Id,
                Title = note.Title,
                Synopsis = note.Synopsis,
                Content = note.Content,
                IsDeleted = note.IsDeleted,
                IsPublic = note.IsPublic,
                Author = new PublicAuthorDto
                {
                    UserName = note.Author.UserName
                }
            }).ToList();

            return Ok(noteResponses);
        }


        [HttpGet("notes/{id}")]
        public async Task<IActionResult> GetNote(Guid id)
        {
            // Check if User is authenticated and resolve their profile
            var (appUser, error) = await _currentUser.ResolveAsync(User);
            if (error != null) return error;

            var note = await _context.Notes
                .Include(n => n.Author)
                .FirstOrDefaultAsync(n => n.Id == id);
            if (note.IsDeleted == true) return NotFound();
            var responseDto = new NoteResponseDto
            {
                Id = note.Id,
                Title = note.Title,
                Content = note.Content,
                Synopsis = note.Synopsis,
                IsPublic = note.IsPublic,
                Author = new PublicAuthorDto
                {
                    UserName = note.Author.UserName
                }
            };
            return Ok(responseDto);
        }

        // Get all notes for a specific user
        [HttpGet("notes/user/{userId}")]
        public async Task<IActionResult> GetNotesForUser(string userId)
        {
            // Check if User is authenticated and resolve their profile
            var (appUser, error) = await _currentUser.ResolveAsync(User);
            if (error != null) return error;

            var notes = await _context.Notes
                .Where(n => n.AuthorId == Guid.Parse(userId) && n.IsDeleted == false)
                .Include(n => n.Author)
                .ToListAsync();
            var noteResponses = notes.Select(note => new NoteResponseDto
            {
                Id = note.Id,
                Title = note.Title,
                Content = note.Content,
                Synopsis = note.Synopsis,
                IsPublic = note.IsPublic,
                Author = new PublicAuthorDto
                {
                    UserName = note.Author.UserName
                }
            }).ToList();
            return Ok(noteResponses);
        }

        // Create a new note
        [HttpPost("notes")]
        public async Task<IActionResult> CreateNote([FromBody] CreateNoteDto noteDto)
        {
            // Check if User is authenticated and resolve their profile
            var (appUser, error) = await _currentUser.ResolveAsync(User);
            if (error != null) return error;


            var note = new Note
            {
                Title = noteDto.Title,
                Content = noteDto.Content,
                Synopsis = noteDto.Synopsis,
                IsPublic = noteDto.IsPublic,
                AuthorId = appUser.Id
            };


            _context.Notes.Add(note);
            await _context.SaveChangesAsync();

            var responseDto = new NoteResponseDto
            {
                Id = note.Id,
                Title = note.Title,
                Content = note.Content,
                Synopsis = note.Synopsis,
                IsPublic = note.IsPublic,
                Author = new PublicAuthorDto
                {
                    UserName = note.Author.UserName
                }
            };

            return CreatedAtAction(nameof(GetNote), new { id = note.Id }, responseDto);
        }

        // Update an existing note
        [HttpPut("notes/{id}")]
        public async Task<IActionResult> UpdateNote(Guid id, [FromBody] UpdateNoteDto noteDto)
        {
            // Check if User is authenticated and resolve their profile
            var (appUser, error) = await _currentUser.ResolveAsync(User);
            if (error != null) return error;

            var note = await _context.Notes.FindAsync(id);
            if (note.IsDeleted == true) return NotFound();
            if (note.AuthorId != appUser.Id) return Forbid();

            note.Title = noteDto.Title;
            note.Content = noteDto.Content;
            note.Synopsis = noteDto.Synopsis;
            note.IsPublic = noteDto.IsPublic;

            await _context.SaveChangesAsync();

            return NoContent();
        }

        // Deleting the note in form of updating isdeleted false to true
        [HttpPatch("notes/{id}/delete")]
        public async Task<IActionResult> SoftDeleteNote(Guid id)
        {
            var (appUser, error) = await _currentUser.ResolveAsync(User);
            if (error != null) return error;

            var note = await _context.Notes.FindAsync(id);
            if (note.IsDeleted == true) return NotFound();
            if (note.AuthorId != appUser.Id) return Forbid();

            note.IsDeleted = true;
            await _context.SaveChangesAsync();

            return NoContent();
        }

        // Restore a soft-deleted note
        [HttpPatch("notes/{id}/restore")]
        public async Task<IActionResult> RestoreNote(Guid id)
        {
            var (appUser, error) = await _currentUser.ResolveAsync(User);
            if (error != null) return error;

            var note = await _context.Notes.FindAsync(id);
            if (note == null) return NotFound();
            if (note.AuthorId != appUser.Id) return Forbid();

            note.IsDeleted = false;
            await _context.SaveChangesAsync();

            return NoContent();
        }

        // Get all deleted notes for a user
        [HttpGet("notes/user/{userId}/trash")]
        public async Task<IActionResult> GetDeletedNotesForUser(Guid userId)
        {
            var (appUser, error) = await _currentUser.ResolveAsync(User);
            if (error != null) return error;

            var notes = await _context.Notes
                .Where(n => n.AuthorId == userId && n.IsDeleted == true) // Filter for deleted notes
                .Include(n => n.Author)
                .ToListAsync();

            var noteResponses = notes.Select(note => new NoteResponseDto
            {
                Id = note.Id,
                Title = note.Title,
                Content = note.Content,
                Synopsis = note.Synopsis,
                IsPublic = note.IsPublic,
                Author = new PublicAuthorDto
                {
                    UserName = note.Author.UserName
                }
            }).ToList();

            return Ok(noteResponses);
        }


        // Count of all public non-deleted notes
        [HttpGet("notes/count")]
        public async Task<IActionResult> GetNoteCount()
        {
            var (appUser, error) = await _currentUser.ResolveAsync(User);
            if (error != null) return error;

            var count = await _context.Notes
                .Where(n => n.IsDeleted == false && n.IsPublic == true)
                .CountAsync();

            return Ok(new { count });
        }

        // Count of current user's non-deleted notes
        [HttpGet("notes/mine/count")]
        public async Task<IActionResult> GetMyNoteCount()
        {
            var (appUser, error) = await _currentUser.ResolveAsync(User);
            if (error != null) return error;

            var count = await _context.Notes
                .Where(n => n.AuthorId == appUser.Id && n.IsDeleted == false)
                .CountAsync();

            return Ok(new { count });
        }

        // Count of current user's deleted notes
        [HttpGet("notes/deleted/count")]
        public async Task<IActionResult> GetDeletedNoteCount()
        {
            var (appUser, error) = await _currentUser.ResolveAsync(User);
            if (error != null) return error;

            var count = await _context.Notes
                .Where(n => n.AuthorId == appUser.Id && n.IsDeleted == true)
                .CountAsync();

            return Ok(new { count });
        }


    }
}
