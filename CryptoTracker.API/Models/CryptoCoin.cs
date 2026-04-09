using System.ComponentModel.DataAnnotations;

namespace CryptoTracker.API.Models;

/// <summary>
/// Монета, яку відстежуємо
/// </summary>
public class CryptoCoin
{
    public int Id { get; set; }

    /// <summary>
    /// Ідентифікатор на CoinGecko (наприклад: "bitcoin", "ethereum")
    /// </summary>
    [Required, MaxLength(100)]
    public string CoinGeckoId { get; set; } = string.Empty;

    /// <summary>
    /// Тікер (наприклад: "BTC", "ETH")
    /// </summary>
    [Required, MaxLength(20)]
    public string Symbol { get; set; } = string.Empty;

    /// <summary>
    /// Повна назва (наприклад: "Bitcoin")
    /// </summary>
    [Required, MaxLength(100)]
    public string Name { get; set; } = string.Empty;

    /// <summary>
    /// Чи відстежувати цю монету у Background Service
    /// </summary>
    public bool IsTracked { get; set; } = true;

    public DateTime AddedAt { get; set; } = DateTime.UtcNow;

    // Навігаційна властивість: один до багатьох
    public ICollection<CryptoPrice> Prices { get; set; } = new List<CryptoPrice>();
}
