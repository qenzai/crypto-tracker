using System.Text.Json.Serialization;

namespace CryptoTracker.API.Services.CoinGecko;

/// <summary>
/// Відповідь CoinGecko /simple/price endpoint
/// </summary>
public class CoinGeckoPriceResponse : Dictionary<string, CoinGeckoCoinData>
{
}

public class CoinGeckoCoinData
{
    [JsonPropertyName("usd")]
    public decimal? Usd { get; set; }

    [JsonPropertyName("usd_market_cap")]
    public decimal? UsdMarketCap { get; set; }

    [JsonPropertyName("usd_24h_vol")]
    public decimal? Usd24hVol { get; set; }

    [JsonPropertyName("usd_24h_change")]
    public decimal? Usd24hChange { get; set; }
}

/// <summary>
/// Результат ціни — повертає наш сервіс
/// </summary>
public class CoinPriceResult
{
    public string CoinGeckoId { get; set; } = string.Empty;
    public decimal Price { get; set; }
    public decimal? MarketCap { get; set; }
    public decimal? Volume24h { get; set; }
    public decimal? PriceChange24h { get; set; }
    public DateTime FetchedAt { get; set; } = DateTime.UtcNow;
}

// ── Пошук ─────────────────────────────────────────────────────────────────────

/// <summary>
/// Відповідь CoinGecko /search endpoint
/// </summary>
public class CoinGeckoSearchResponse
{
    [JsonPropertyName("coins")]
    public List<CoinGeckoSearchCoin> Coins { get; set; } = new();
}

public class CoinGeckoSearchCoin
{
    [JsonPropertyName("id")]
    public string Id { get; set; } = string.Empty;

    [JsonPropertyName("name")]
    public string Name { get; set; } = string.Empty;

    [JsonPropertyName("symbol")]
    public string Symbol { get; set; } = string.Empty;

    [JsonPropertyName("market_cap_rank")]
    public int? MarketCapRank { get; set; }

    [JsonPropertyName("thumb")]
    public string Thumb { get; set; } = string.Empty;
}

/// <summary>
/// Результат пошуку — повертає наш API
/// </summary>
public class CoinSearchResult
{
    public string CoinGeckoId { get; set; } = string.Empty;
    public string Name { get; set; } = string.Empty;
    public string Symbol { get; set; } = string.Empty;
    public int? MarketCapRank { get; set; }
    public string Thumb { get; set; } = string.Empty;
}
