using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace CryptoTracker.API.Models;

/// <summary>
/// Знімок ціни монети в певний момент часу
/// </summary>
public class CryptoPrice
{
    public int Id { get; set; }

    // Зовнішній ключ
    public int CryptoCoinId { get; set; }

    [ForeignKey(nameof(CryptoCoinId))]
    public CryptoCoin CryptoCoin { get; set; } = null!;

    /// <summary>
    /// Поточна ціна в USD
    /// </summary>
    [Column(TypeName = "decimal(20,8)")]
    public decimal Price { get; set; }

    /// <summary>
    /// Ринкова капіталізація в USD
    /// </summary>
    [Column(TypeName = "decimal(30,2)")]
    public decimal? MarketCap { get; set; }

    /// <summary>
    /// Обсяг торгів за 24 години
    /// </summary>
    [Column(TypeName = "decimal(30,2)")]
    public decimal? Volume24h { get; set; }

    /// <summary>
    /// Зміна ціни за 24 години у відсотках
    /// </summary>
    [Column(TypeName = "decimal(10,4)")]
    public decimal? PriceChange24h { get; set; }

    /// <summary>
    /// Час запису даних (UTC)
    /// </summary>
    public DateTime RecordedAt { get; set; } = DateTime.UtcNow;
}
