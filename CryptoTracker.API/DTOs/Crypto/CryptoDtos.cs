using System.ComponentModel.DataAnnotations;

namespace CryptoTracker.API.DTOs.Crypto;

// ── Coin DTOs ─────────────────────────────────────────────────────────────────

public class CryptoCoinDto
{
    public int Id { get; set; }
    public string CoinGeckoId { get; set; } = string.Empty;
    public string Symbol { get; set; } = string.Empty;
    public string Name { get; set; } = string.Empty;
    public bool IsTracked { get; set; }
    public DateTime AddedAt { get; set; }
    public decimal? LatestPrice { get; set; }
    public decimal? PriceChange24h { get; set; }
}

public class CreateCoinDto
{
    [Required(ErrorMessage = "CoinGecko ID обов'язковий")]
    public string CoinGeckoId { get; set; } = string.Empty;

    [Required(ErrorMessage = "Символ обов'язковий")]
    [MaxLength(20)]
    public string Symbol { get; set; } = string.Empty;

    [Required(ErrorMessage = "Назва обов'язкова")]
    [MaxLength(100)]
    public string Name { get; set; } = string.Empty;
}

public class UpdateCoinDto
{
    public string? Name { get; set; }
    public bool? IsTracked { get; set; }
}

// ── Price DTOs ─────────────────────────────────────────────────────────────────

public class CryptoPriceDto
{
    public int Id { get; set; }
    public int CryptoCoinId { get; set; }
    public string CoinName { get; set; } = string.Empty;
    public string Symbol { get; set; } = string.Empty;
    public decimal Price { get; set; }
    public decimal? MarketCap { get; set; }
    public decimal? Volume24h { get; set; }
    public decimal? PriceChange24h { get; set; }
    public DateTime RecordedAt { get; set; }
}

// ── Stats DTOs ─────────────────────────────────────────────────────────────────

public class CoinStatsDto
{
    public int CoinId { get; set; }
    public string CoinName { get; set; } = string.Empty;
    public string Symbol { get; set; } = string.Empty;

    public decimal MinPrice { get; set; }
    public decimal MaxPrice { get; set; }
    public decimal AvgPrice { get; set; }
    public decimal? LatestPrice { get; set; }

    public decimal? MinMarketCap { get; set; }
    public decimal? MaxMarketCap { get; set; }
    public decimal? AvgMarketCap { get; set; }

    public decimal? AvgVolume24h { get; set; }

    public int RecordsCount { get; set; }
    public DateTime? From { get; set; }
    public DateTime? To { get; set; }

    /// <summary>
    /// Дані для графіка (час + ціна)
    /// </summary>
    public List<PricePointDto> PriceHistory { get; set; } = new();
}

public class PricePointDto
{
    public DateTime RecordedAt { get; set; }
    public decimal Price { get; set; }
}
