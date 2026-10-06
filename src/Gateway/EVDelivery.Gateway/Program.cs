using System.Text;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.IdentityModel.Tokens;
using Serilog;

var builder = WebApplication.CreateBuilder(args);

// Configure Serilog
Log.Logger = new LoggerConfiguration()
    .ReadFrom.Configuration(builder.Configuration)
    .Enrich.FromLogContext()
    .WriteTo.Console(outputTemplate: "[{Timestamp:HH:mm:ss} {Level:u3}] [{CorrelationId}] {Message:lj}{NewLine}{Exception}")
    .CreateLogger();

builder.Host.UseSerilog();

// JWT Authentication
var jwtSecret = builder.Configuration["Jwt:Secret"] 
    ?? "super_secret_ev_delivery_jwt_key_2026_at_least_32_chars_long!";
var jwtIssuer = builder.Configuration["Jwt:Issuer"] ?? "EVDeliveryGateway";
var jwtAudience = builder.Configuration["Jwt:Audience"] ?? "EVDeliveryPlatform";

builder.Services.AddAuthentication(JwtBearerDefaults.AuthenticationScheme)
    .AddJwtBearer(options =>
    {
        options.RequireHttpsMetadata = false;
        options.TokenValidationParameters = new TokenValidationParameters
        {
            ValidateIssuer = true,
            ValidateAudience = true,
            ValidateLifetime = true,
            ValidateIssuerSigningKey = true,
            ValidIssuer = jwtIssuer,
            ValidAudience = jwtAudience,
            IssuerSigningKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(jwtSecret))
        };
    });

builder.Services.AddAuthorization();

// CORS
builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowFrontend", policy =>
    {
        policy.WithOrigins(
                "http://localhost:5173",
                "http://localhost:3000",
                "http://127.0.0.1:5173")
            .AllowAnyMethod()
            .AllowAnyHeader()
            .AllowCredentials();
    });
});

// HTTP Client for token generation/auth
builder.Services.AddHttpClient();

// YARP
builder.Services.AddReverseProxy()
    .LoadFromConfig(builder.Configuration.GetSection("ReverseProxy"));

builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen(c =>
{
    c.SwaggerDoc("v1", new Microsoft.OpenApi.Models.OpenApiInfo
    {
        Title = "EV Delivery - API Gateway",
        Version = "v1",
        Description = "YARP API Gateway for EV Delivery Management Platform"
    });
});

var app = builder.Build();

// Middleware
app.UseSerilogRequestLogging();

// Correlation ID middleware
app.Use(async (context, next) =>
{
    const string correlationHeader = "X-Correlation-ID";
    var correlationId = context.Request.Headers[correlationHeader].FirstOrDefault()
        ?? Guid.NewGuid().ToString("D");
    context.Items["CorrelationId"] = correlationId;
    context.Response.Headers.Append(correlationHeader, correlationId);
    Serilog.Context.LogContext.PushProperty("CorrelationId", correlationId);
    await next();
});

app.UseCors("AllowFrontend");
app.UseAuthentication();
app.UseAuthorization();

if (app.Environment.IsDevelopment() || true)
{
    app.UseSwagger();
    app.UseSwaggerUI(c => c.SwaggerEndpoint("/swagger/v1/swagger.json", "API Gateway v1"));
}

// Health
app.MapGet("/health", () => Results.Ok(new { status = "Healthy", service = "EVDelivery.Gateway", timestamp = DateTimeOffset.UtcNow }));

// JWT Token endpoint (local auth - generates token for demo purposes)
app.MapPost("/api/auth/login", (LoginRequest req) =>
{
    // Demo users - in production, this would validate against a real identity store
    var users = new Dictionary<string, (string password, string role)>(StringComparer.OrdinalIgnoreCase)
    {
        ["admin@evdelivery.com"] = ("Admin@123!", "ADMIN"),
        ["tech@evdelivery.com"] = ("Tech@123!", "TECHNICIAN"),
        ["sales@evdelivery.com"] = ("Sales@123!", "SALES")
    };

    if (!users.TryGetValue(req.Email, out var user) || user.password != req.Password)
    {
        return Results.Unauthorized();
    }

    var claims = new[]
    {
        new System.Security.Claims.Claim(System.Security.Claims.ClaimTypes.Name, req.Email),
        new System.Security.Claims.Claim(System.Security.Claims.ClaimTypes.Email, req.Email),
        new System.Security.Claims.Claim(System.Security.Claims.ClaimTypes.Role, user.role),
        new System.Security.Claims.Claim("role", user.role),
    };

    var key = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(jwtSecret));
    var creds = new SigningCredentials(key, SecurityAlgorithms.HmacSha256);
    var expirationMinutes = builder.Configuration.GetValue<int>("Jwt:ExpirationMinutes", 480);

    var token = new System.IdentityModel.Tokens.Jwt.JwtSecurityToken(
        issuer: jwtIssuer,
        audience: jwtAudience,
        claims: claims,
        expires: DateTime.UtcNow.AddMinutes(expirationMinutes),
        signingCredentials: creds
    );

    var tokenString = new System.IdentityModel.Tokens.Jwt.JwtSecurityTokenHandler().WriteToken(token);

    return Results.Ok(new
    {
        token = tokenString,
        email = req.Email,
        role = user.role,
        expiresAt = DateTime.UtcNow.AddMinutes(expirationMinutes)
    });
});

// YARP proxy
app.MapReverseProxy();

app.Run();

record LoginRequest(string Email, string Password);
