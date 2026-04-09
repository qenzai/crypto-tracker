using System.Text.Json;

namespace CryptoTracker.API.Services.CoinGecko;

// ── Інтерфейс ─────────────────────────────────────────────────────────────────

public interface ICoinGeckoService
{
    Task<List<CoinPriceResult>> GetPricesAsync(IEnumerable<string> coinIds);
    Task<List<CoinSearchResult>> SearchCoinsAsync(string query);
}

// ── Реалізація ─────────────────────────────────────────────────────────────────

public class CoinGeckoService : ICoinGeckoService
{
    private readonly HttpClient _httpClient;
    private readonly IConfiguration _config;
    private readonly ILogger<CoinGeckoService> _logger;

    private static readonly JsonSerializerOptions JsonOptions = new()
    {
        PropertyNameCaseInsensitive = true
    };

    public CoinGeckoService(
        HttpClient httpClient,
        IConfiguration config,
        ILogger<CoinGeckoService> logger)
    {
        _httpClient = httpClient;
        _config = config;
        _logger = logger;

        var baseUrl = _config["CoinGecko:BaseUrl"] ?? "https://api.coingecko.com/api/v3/";
        _httpClient.BaseAddress = new Uri(baseUrl);
        _httpClient.DefaultRequestHeaders.Add("Accept", "application/json");
        _httpClient.DefaultRequestHeaders.Add("User-Agent", "CryptoTracker/1.0");
    }

    // ── Отримати ціни ─────────────────────────────────────────────────────────

    public async Task<List<CoinPriceResult>> GetPricesAsync(IEnumerable<string> coinIds)
    {
        var ids = string.Join(",", coinIds);
        if (string.IsNullOrEmpty(ids))
            return new List<CoinPriceResult>();

        var url = $"simple/price?ids={ids}" +
                  "&vs_currencies=usd" +
                  "&include_market_cap=true" +
                  "&include_24hr_vol=true" +
                  "&include_24hr_change=true";

        try
        {
            var response = await _httpClient.GetAsync(url);
            response.EnsureSuccessStatusCode();

            var json = await response.Content.ReadAsStringAsync();
            var data = JsonSerializer.Deserialize<CoinGeckoPriceResponse>(json, JsonOptions);

            if (data is null) return new List<CoinPriceResult>();

            var results = new List<CoinPriceResult>();
            foreach (var (coinId, coinData) in data)
            {
                if (coinData.Usd is null) continue;
                results.Add(new CoinPriceResult
                {
                    CoinGeckoId = coinId,
                    Price = coinData.Usd.Value,
                    MarketCap = coinData.UsdMarketCap,
                    Volume24h = coinData.Usd24hVol,
                    PriceChange24h = coinData.Usd24hChange,
                    FetchedAt = DateTime.UtcNow
                });
            }

            _logger.LogInformation("CoinGecko: отримано дані для {Count} монет", results.Count);
            return results;
        }
        catch (HttpRequestException ex)
        {
            _logger.LogError(ex, "Помилка запиту до CoinGecko API");
            throw;
        }
    }

    // ── Пошук монет ───────────────────────────────────────────────────────────

    public async Task<List<CoinSearchResult>> SearchCoinsAsync(string query)
    {
        if (string.IsNullOrWhiteSpace(query))
            return new List<CoinSearchResult>();

        try
        {
            var url = $"search?query={Uri.EscapeDataString(query)}";
            var response = await _httpClient.GetAsync(url);
            response.EnsureSuccessStatusCode();

            var json = await response.Content.ReadAsStringAsync();
            var data = JsonSerializer.Deserialize<CoinGeckoSearchResponse>(json, JsonOptions);

            if (data is null) return new List<CoinSearchResult>();

            // Повертаємо топ-10 результатів
            return data.Coins
                .Take(10)
                .Select(c => new CoinSearchResult
                {
                    CoinGeckoId = c.Id,
                    Name = c.Name,
                    Symbol = c.Symbol.ToUpper(),
                    MarketCapRank = c.MarketCapRank,
                    Thumb = c.Thumb
                })
                .ToList();
        }
        catch (HttpRequestException ex)
        {
            _logger.LogError(ex, "Помилка пошуку монет CoinGecko");
            return new List<CoinSearchResult>();
        }
    }
}
