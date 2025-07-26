using Microsoft.EntityFrameworkCore;
using System.Text.Json;
using TaskManager.API.Data;
using TaskManager.API.Models;

var builder = WebApplication.CreateBuilder(args);

// --- Services ko container mein add karein ---

// CORS Policy Add Karein
builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowReactApp", policy =>
    {
        policy.WithOrigins("http://localhost:3000", "https://taskboardp5pin.netlify.app") // React app ka address
              .AllowAnyHeader()
              .AllowAnyMethod();
    });
});


// DbContext ko SQLite ke liye configure karein
builder.Services.AddDbContext<DataContext>(options =>
{
    options.UseSqlite(builder.Configuration.GetConnectionString("DefaultConnection"));
});

// Add HttpClient for making API calls to Gemini
builder.Services.AddHttpClient();

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

// --- API Endpoints ---

// (Aapke purane CRUD endpoints yahan hain)
// ...
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


// POST: AI se sub-tasks generate karne ke liye
app.MapPost("/api/ai/generate-subtasks", async (IHttpClientFactory clientFactory, TaskItem task) =>
{
    var apiKey = Environment.GetEnvironmentVariable("GEMINI_API_KEY");
    if (string.IsNullOrEmpty(apiKey))
    {
        return Results.Problem("AI API Key is not configured.");
    }

    var prompt = $"Break down the following task into a simple JSON array of strings: \"{task.Title}\". Provide only the JSON array.";

    var geminiUrl = $"https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash-latest:generateContent?key={apiKey}";

    var payload = new
    {
        contents = new[]
        {
            new { parts = new[] { new { text = prompt } } }
        }
    };

    var httpClient = clientFactory.CreateClient();
    var response = await httpClient.PostAsJsonAsync(geminiUrl, payload);

    if (!response.IsSuccessStatusCode)
    {
        return Results.Problem("Failed to get response from AI service.");
    }

    var jsonResponse = await response.Content.ReadFromJsonAsync<JsonElement>();
    try
    {
        var subtasksText = jsonResponse.GetProperty("candidates")[0].GetProperty("content").GetProperty("parts")[0].GetProperty("text").GetString();

        // Clean the response to get only the JSON array
        var startIndex = subtasksText.IndexOf('[');
        var endIndex = subtasksText.LastIndexOf(']');
        var jsonArrayString = subtasksText.Substring(startIndex, endIndex - startIndex + 1);

        var subtasks = JsonSerializer.Deserialize<List<string>>(jsonArrayString);
        return Results.Ok(subtasks);
    }
    catch (Exception)
    {
        return Results.Problem("Failed to parse AI response.");
    }
});



// Automatically apply migrations on startup
using (var scope = app.Services.CreateScope())
{
    var dbContext = scope.ServiceProvider.GetRequiredService<DataContext>();
    dbContext.Database.Migrate();
}


app.Run();