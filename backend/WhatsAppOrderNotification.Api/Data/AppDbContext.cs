using Microsoft.EntityFrameworkCore;

namespace WhatsAppOrderNotification.Api.Data;

public class AppDbContext : DbContext
{
    public AppDbContext(DbContextOptions<AppDbContext> options) : base(options)
    {
    }

    public DbSet<Customer> Customers => Set<Customer>();

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        modelBuilder.Entity<Customer>(entity =>
        {
            entity.HasIndex(c => c.Document).IsUnique();
            entity.Property(c => c.Status).HasConversion<string>();
        });
    }
}
