using System.ComponentModel.DataAnnotations;

namespace TaskManager.API.Models
{
    // Yeh class hamare ek single task ko represent karti hai.
    public class TaskItem
    {
        [Key] // Yeh batata hai ki Id property primary key hai.
        public int Id { get; set; }

        [Required] // Yeh batata hai ki Title field zaroori hai.
        [StringLength(100)] // Title ki max length 100 characters hogi.
        public string? Title { get; set; }

        [StringLength(500)] // Description ki max length 500 characters hogi.
        public string? Description { get; set; }

        [Required]
        public string? Status { get; set; } // e.g., "To Do", "In Progress", "Done"

        public DateTime CreatedDate { get; set; } = DateTime.UtcNow;

        // Aap yahan aur bhi properties jod sakte hain, jaise:
        // public string? Assignee { get; set; }
        // public int Priority { get; set; } // 1 (High), 2 (Medium), 3 (Low)
    }
}
