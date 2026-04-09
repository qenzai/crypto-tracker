using System.ComponentModel.DataAnnotations;

namespace CryptoTracker.API.DTOs.Auth;

public class LoginDto
{
    [Required(ErrorMessage = "Email обов'язковий")]
    [EmailAddress]
    public string Email { get; set; } = string.Empty;

    [Required(ErrorMessage = "Пароль обов'язковий")]
    [MinLength(6, ErrorMessage = "Мінімум 6 символів")]
    public string Password { get; set; } = string.Empty;
}

public class RegisterDto
{
    [Required(ErrorMessage = "Ім'я користувача обов'язкове")]
    [MinLength(3), MaxLength(50)]
    public string Username { get; set; } = string.Empty;

    [Required(ErrorMessage = "Email обов'язковий")]
    [EmailAddress]
    public string Email { get; set; } = string.Empty;

    [Required(ErrorMessage = "Пароль обов'язковий")]
    [MinLength(6, ErrorMessage = "Мінімум 6 символів")]
    public string Password { get; set; } = string.Empty;
}

public class AuthResponseDto
{
    public string Token { get; set; } = string.Empty;
    public string Username { get; set; } = string.Empty;
    public string Email { get; set; } = string.Empty;
    public DateTime ExpiresAt { get; set; }
}
