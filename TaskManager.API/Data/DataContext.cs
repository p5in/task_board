using Microsoft.EntityFrameworkCore;
using TaskManager.API.Models; // TaskItem model ko import karna zaroori hai

namespace TaskManager.API.Data
{
    // Yeh class DbContext se inherit karti hai.
    // Yeh Entity Framework Core aur database ke beech ka session represent karti hai.
    public class DataContext : DbContext
    {
        // Yeh constructor options ko base DbContext class tak pahunchata hai.
        public DataContext(DbContextOptions<DataContext> options) : base(options)
        {
        }

        // Yeh property database mein "TaskItems" naam ki ek table banayegi.
        // Hum is property ka istemal tasks ko query karne aur save karne ke liye karenge.
        public DbSet<TaskItem> TaskItems { get; set; }
    }
}
