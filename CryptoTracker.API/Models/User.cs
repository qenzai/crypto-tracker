using System.ComponentModel.DataAnnotations;

namespace CryptoTracker.API.Models;

/// <summary>
/// Модель користувача системи
/// </summary>
public class User
{
    public int Id { get; set; }

    [Required, MaxLength(50)]
    public string Username { get; set; } = string.Empty;

    [Required, MaxLength(100)]
    public string Email { get; set; } = string.Empty;

    /// <summary>
    /// Хеш пароля (BCrypt)
    /// </summary>
    [Required]
    public string PasswordHash { get; set; } = string.Empty;

    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
}
