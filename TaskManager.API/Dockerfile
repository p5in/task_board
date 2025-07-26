# Stage 1: Build the application
# Use the .NET 9 SDK to match your project's target framework
FROM mcr.microsoft.com/dotnet/sdk:9.0 AS build
WORKDIR /app

# Copy csproj and restore as distinct layers
COPY *.csproj ./
RUN dotnet restore

# Copy everything else and build
COPY . ./
RUN dotnet publish -c Release -o out

# Stage 2: Create the final runtime image
# Use the .NET 9 runtime
FROM mcr.microsoft.com/dotnet/aspnet:9.0 AS runtime
WORKDIR /app
COPY --from=build /app/out ./

# Expose the port the app runs on
EXPOSE 10000

# Set the entrypoint
ENTRYPOINT ["dotnet", "TaskManager.API.dll"]
