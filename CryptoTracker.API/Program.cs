using System.Text;
using CryptoTracker.API.Data;
using CryptoTracker.API.Services.Auth;
using CryptoTracker.API.Services.Background;
using CryptoTracker.API.Services.CoinGecko;
using CryptoTracker.API.Services.Crypto;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using Microsoft.OpenApi.Models;

var builder = WebApplication.CreateBuilder(args);

// ──────────────────────────────────────────────────────────
//  Controllers
// ──────────────────────────────────────────────────────────
builder.Services.AddControllers();
builder.Services.AddEndpointsApiExplorer();

// ──────────────────────────────────────────────────────────
//  Swagger + JWT підтримка в UI
// ──────────────────────────────────────────────────────────
builder.Services.AddSwaggerGen(c =>
{
    c.SwaggerDoc("v1", new OpenApiInfo
    {
        Title = "CryptoTracker API",
        Version = "v1",
        Description = "API для відстеження криптовалют у реальному часі. " +
                      "Парсинг даних з CoinGecko, зберігання в MySQL, " +
                      "агрегація (min/max/avg) та JWT авторизація."
    });

    // Налаштування Bearer Token у Swagger UI
    c.AddSecurityDefinition("Bearer", new OpenApiSecurityScheme
    {
        Description = "JWT авторизація. Введіть: Bearer {ваш_токен}",
        Name = "Authorization",
        In = ParameterLocation.Header,
        Type = SecuritySchemeType.ApiKey,
        Scheme = "Bearer"
    });

    c.AddSecurityRequirement(new OpenApiSecurityRequirement
    {
        {
            new OpenApiSecurityScheme
            {
                Reference = new OpenApiReference
                {
                    Type = ReferenceType.SecurityScheme,
                    Id = "Bearer"
                }
            },
            Array.Empty<string>()
        }
    });
});

// ──────────────────────────────────────────────────────────
//  MySQL через Entity Framework Core (Pomelo provider)
// ──────────────────────────────────────────────────────────
var connectionString = builder.Configuration.GetConnectionString("DefaultConnection")!;
builder.Services.AddDbContext<AppDbContext>(options =>
    options.UseMySql(connectionString, ServerVersion.AutoDetect(connectionString)));

// ──────────────────────────────────────────────────────────
//  JWT Автентифікація
// ──────────────────────────────────────────────────────────
var jwtKey = builder.Configuration["Jwt:Key"]!;
var jwtIssuer = builder.Configuration["Jwt:Issuer"]!;
var jwtAudience = builder.Configuration["Jwt:Audience"]!;

builder.Services.AddAuthentication(JwtBearerDefaults.AuthenticationScheme)
    .AddJwtBearer(options =>
    {
        options.TokenValidationParameters = new TokenValidationParameters
        {
            ValidateIssuer = true,
            ValidateAudience = true,
            ValidateLifetime = true,
            ValidateIssuerSigningKey = true,
            ValidIssuer = jwtIssuer,
            ValidAudience = jwtAudience,
            IssuerSigningKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(jwtKey)),
            ClockSkew = TimeSpan.Zero
        };
    });

builder.Services.AddAuthorization();

// ──────────────────────────────────────────────────────────
//  CORS для Angular (localhost:4200)
// ──────────────────────────────────────────────────────────
builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowAngular", policy =>
        policy.WithOrigins("http://localhost:4200")
              .AllowAnyHeader()
              .AllowAnyMethod());
});

// ──────────────────────────────────────────────────────────
//  Dependency Injection
// ──────────────────────────────────────────────────────────
builder.Services.AddHttpClient<ICoinGeckoService, CoinGeckoService>();
builder.Services.AddScoped<IAuthService, AuthService>();
builder.Services.AddScoped<ICryptoPriceService, CryptoPriceService>();

// Background Service — парсинг за розкладом
builder.Services.AddHostedService<CryptoPriceBackgroundService>();

var app = builder.Build();

// ──────────────────────────────────────────────────────────
//  Автоматична міграція БД при старті
// ──────────────────────────────────────────────────────────
using (var scope = app.Services.CreateScope())
{
    var db = scope.ServiceProvider.GetRequiredService<AppDbContext>();
    db.Database.Migrate();
}

// ──────────────────────────────────────────────────────────
//  Middleware Pipeline
// ──────────────────────────────────────────────────────────
app.UseSwagger();
app.UseSwaggerUI(c =>
{
    c.SwaggerEndpoint("/swagger/v1/swagger.json", "CryptoTracker API v1");
    c.RoutePrefix = "swagger";
});

app.UseCors("AllowAngular");
app.UseAuthentication();
app.UseAuthorization();
app.MapControllers();

app.Run();
