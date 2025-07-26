using Microsoft.EntityFrameworkCore;
using TaskManager.API.Data;
using TaskManager.API.Models;

var builder = WebApplication.CreateBuilder(args);

// --- Services ko container mein add karein ---

// CORS Policy Add Karein
builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowReactApp", policy =>
    {
        policy.WithOrigins("http://localhost:3000") // React app ka address
              .AllowAnyHeader()
              .AllowAnyMethod();
    });
});


// DbContext ko SQLite ke liye configure karein
builder.Services.AddDbContext<DataContext>(options =>
{
    options.UseSqlite(builder.Configuration.GetConnectionString("DefaultConnection"));
});

builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

var app = builder.Build();

// --- HTTP request pipeline ko configure karein ---

if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

app.UseHttpsRedirection();

// CORS Policy ka istemal karein
app.UseCors("AllowReactApp");


// --- Yahan hum apne API Endpoints banayenge ---
// (Aapke baaki ke endpoints yahan aayenge)

app.MapGet("/", () => "Hello from Task Manager API!");

// GET: Saare tasks fetch karne ke liye
app.MapGet("/api/tasks", async (DataContext context) =>
{
    return await context.TaskItems.ToListAsync();
});

// POST: Naya task banane ke liye
app.MapPost("/api/tasks", async (DataContext context, TaskItem task) =>
{
    context.TaskItems.Add(task);
    await context.SaveChangesAsync();
    return Results.Created($"/api/tasks/{task.Id}", task);
});

// PUT: Task ko update karne ke liye
app.MapPut("/api/tasks/{id}", async (DataContext context, int id, TaskItem updatedTask) =>
{
    var task = await context.TaskItems.FindAsync(id);

    if (task is null) return Results.NotFound();

    task.Title = updatedTask.Title;
    task.Description = updatedTask.Description;
    task.Status = updatedTask.Status;

    await context.SaveChangesAsync();
    return Results.NoContent();
});

// DELETE: Task ko delete karne ke liye
app.MapDelete("/api/tasks/{id}", async (DataContext context, int id) =>
{
    var task = await context.TaskItems.FindAsync(id);

    if (task is null) return Results.NotFound();

    context.TaskItems.Remove(task);
    await context.SaveChangesAsync();
    return Results.NoContent();
});


app.Run();