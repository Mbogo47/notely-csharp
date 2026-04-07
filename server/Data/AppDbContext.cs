using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Identity.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore;
using Server.Entities;

namespace server.Data;

public class AppDbContext : IdentityDbContext<IdentityUser>
{
      public DbSet<User> Users { get; set; }
      public DbSet<Note> Notes { get; set; }

      public AppDbContext(DbContextOptions<AppDbContext> options) : base(options) { }

      protected override void OnModelCreating(ModelBuilder modelBuilder)
      {
            base.OnModelCreating(modelBuilder);

            modelBuilder.Entity<User>(entity =>
            {
                  // Primary key
                  entity.HasKey(u => u.Id);

                  // Required fields
                  entity.Property(u => u.UserName)
                .IsRequired()
                .HasMaxLength(100);

                  entity.Property(u => u.FirstName)
                .IsRequired()
                .HasMaxLength(50);

                  entity.Property(u => u.LastName)
                .IsRequired()
                .HasMaxLength(50);

                  entity.Property(u => u.EmailAddress)
                .IsRequired()
                .HasMaxLength(255);

                  // Unique constraints
                  entity.HasIndex(u => u.UserName).IsUnique();
                  entity.HasIndex(u => u.EmailAddress).IsUnique();

                  // Default values
                  entity.Property(u => u.IsDeleted).HasDefaultValue(false);

                  // Relationships
                  entity.HasMany(u => u.Notes)
                .WithOne(n => n.Author)
                .HasForeignKey(n => n.AuthorId)
                .OnDelete(DeleteBehavior.Cascade);
            });

            modelBuilder.Entity<Note>(entity =>
            {
                  entity.HasKey(n => n.Id);

                  entity.Property(n => n.Title)
                .IsRequired()
                .HasMaxLength(200);

                  entity.Property(n => n.Synopsis)
                .IsRequired()
                .HasMaxLength(500);

                  entity.Property(n => n.Content)
                .IsRequired();

                  entity.Property(n => n.IsDeleted).HasDefaultValue(false);
                  entity.Property(n => n.IsPublic).HasDefaultValue(true);

                  entity.HasIndex(n => n.AuthorId);
            });
      }
}
