using CryptoTracker.API.Data;
using CryptoTracker.API.Services.CoinGecko;
using CryptoTracker.API.Services.Crypto;
using Microsoft.EntityFrameworkCore;

namespace CryptoTracker.API.Services.Background;

/// <summary>
/// Фоновий сервіс: автоматично парсить ціни з CoinGecko за розкладом.
/// Запускається при старті сервера, інтервал задається в appsettings.json.
/// </summary>
public class CryptoPriceBackgroundService : BackgroundService
{
    private readonly IServiceProvider _services;
    private readonly IConfiguration _config;
    private readonly ILogger<CryptoPriceBackgroundService> _logger;

    public CryptoPriceBackgroundService(
        IServiceProvider services,
        IConfiguration config,
        ILogger<CryptoPriceBackgroundService> logger)
    {
        _services = services;
        _config = config;
        _logger = logger;
    }

    protected override async Task ExecuteAsync(CancellationToken stoppingToken)
    {
        var intervalMinutes = int.Parse(
            _config["CoinGecko:FetchIntervalMinutes"] ?? "5");

        _logger.LogInformation(
            "Background Service запущено. Інтервал: {Minutes} хв.", intervalMinutes);

        // Перший запит одразу при старті
        await FetchAndSavePricesAsync(stoppingToken);

        while (!stoppingToken.IsCancellationRequested)
        {
            await Task.Delay(TimeSpan.FromMinutes(intervalMinutes), stoppingToken);

            if (!stoppingToken.IsCancellationRequested)
                await FetchAndSavePricesAsync(stoppingToken);
        }
    }

    private async Task FetchAndSavePricesAsync(CancellationToken ct)
    {
        _logger.LogInformation("Парсинг цін: {Time}", DateTime.UtcNow);

        // BackgroundService — singleton, тому отримуємо scope вручну
        using var scope = _services.CreateScope();
        var db = scope.ServiceProvider.GetRequiredService<AppDbContext>();
        var coinGecko = scope.ServiceProvider.GetRequiredService<ICoinGeckoService>();
        var priceService = scope.ServiceProvider.GetRequiredService<ICryptoPriceService>();

        try
        {
            // Отримуємо всі активні (IsTracked = true) монети з БД
            var trackedCoins = await db.CryptoCoins
                .Where(c => c.IsTracked)
                .ToListAsync(ct);

            if (!trackedCoins.Any())
            {
                _logger.LogWarning("Немає відстежуваних монет у БД.");
                return;
            }

            var coinIds = trackedCoins.Select(c => c.CoinGeckoId);

            // Запит до CoinGecko
            var prices = await coinGecko.GetPricesAsync(coinIds);

            // Зберігаємо кожну ціну в БД
            foreach (var priceResult in prices)
            {
                var coin = trackedCoins.FirstOrDefault(
                    c => c.CoinGeckoId == priceResult.CoinGeckoId);

                if (coin is null) continue;

                await priceService.SavePriceAsync(
                    coin.Id,
                    priceResult.Price,
                    priceResult.MarketCap,
                    priceResult.Volume24h,
                    priceResult.PriceChange24h
                );
            }

            _logger.LogInformation(
                "Збережено {Count} цінових записів.", prices.Count);
        }
        catch (Exception ex) when (ex is not OperationCanceledException)
        {
            // Не зупиняємо сервіс при помилці мережі — просто логуємо
            _logger.LogError(ex, "Помилка парсингу цін з CoinGecko.");
        }
    }
}
