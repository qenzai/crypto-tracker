using CryptoTracker.API.Data;
using CryptoTracker.API.DTOs.Crypto;
using CryptoTracker.API.Models;
using Microsoft.EntityFrameworkCore;

namespace CryptoTracker.API.Services.Crypto;

// ── Інтерфейс ─────────────────────────────────────────────────────────────────

public interface ICryptoPriceService
{
    // CRUD монет
    Task<List<CryptoCoinDto>> GetAllCoinsAsync();
    Task<CryptoCoinDto?> GetCoinByIdAsync(int id);
    Task<CryptoCoinDto> CreateCoinAsync(CreateCoinDto dto);
    Task<CryptoCoinDto?> UpdateCoinAsync(int id, UpdateCoinDto dto);
    Task<bool> DeleteCoinAsync(int id);

    // Ціни
    Task<List<CryptoPriceDto>> GetPricesAsync(int coinId, DateTime? from, DateTime? to, int limit);
    Task SavePriceAsync(int coinId, decimal price, decimal? marketCap, decimal? volume24h, decimal? priceChange24h);

    // Агрегація
    Task<CoinStatsDto?> GetStatsAsync(int coinId, DateTime? from, DateTime? to);
}

// ── Реалізація ─────────────────────────────────────────────────────────────────

public class CryptoPriceService : ICryptoPriceService
{
    private readonly AppDbContext _db;

    public CryptoPriceService(AppDbContext db) => _db = db;

    // ──────────────────────────────── CRUD монет ──────────────────────────────

    public async Task<List<CryptoCoinDto>> GetAllCoinsAsync()
    {
        return await _db.CryptoCoins
            .Select(c => new CryptoCoinDto
            {
                Id = c.Id,
                CoinGeckoId = c.CoinGeckoId,
                Symbol = c.Symbol,
                Name = c.Name,
                IsTracked = c.IsTracked,
                AddedAt = c.AddedAt,
                // Остання ціна
                LatestPrice = c.Prices
                    .OrderByDescending(p => p.RecordedAt)
                    .Select(p => (decimal?)p.Price)
                    .FirstOrDefault(),
                PriceChange24h = c.Prices
                    .OrderByDescending(p => p.RecordedAt)
                    .Select(p => p.PriceChange24h)
                    .FirstOrDefault()
            })
            .OrderBy(c => c.Name)
            .ToListAsync();
    }

    public async Task<CryptoCoinDto?> GetCoinByIdAsync(int id)
    {
        var coin = await _db.CryptoCoins.FindAsync(id);
        if (coin is null) return null;

        var latestPrice = await _db.CryptoPrices
            .Where(p => p.CryptoCoinId == id)
            .OrderByDescending(p => p.RecordedAt)
            .FirstOrDefaultAsync();

        return MapToDto(coin, latestPrice);
    }

    public async Task<CryptoCoinDto> CreateCoinAsync(CreateCoinDto dto)
    {
        if (await _db.CryptoCoins.AnyAsync(c => c.CoinGeckoId == dto.CoinGeckoId))
            throw new InvalidOperationException(
                $"Монета з ID '{dto.CoinGeckoId}' вже є в системі.");

        var coin = new CryptoCoin
        {
            CoinGeckoId = dto.CoinGeckoId.ToLower(),
            Symbol = dto.Symbol.ToUpper(),
            Name = dto.Name,
            IsTracked = true,
            AddedAt = DateTime.UtcNow
        };

        _db.CryptoCoins.Add(coin);
        await _db.SaveChangesAsync();

        return MapToDto(coin, null);
    }

    public async Task<CryptoCoinDto?> UpdateCoinAsync(int id, UpdateCoinDto dto)
    {
        var coin = await _db.CryptoCoins.FindAsync(id);
        if (coin is null) return null;

        if (dto.Name is not null) coin.Name = dto.Name;
        if (dto.IsTracked is not null) coin.IsTracked = dto.IsTracked.Value;

        await _db.SaveChangesAsync();

        var latestPrice = await _db.CryptoPrices
            .Where(p => p.CryptoCoinId == id)
            .OrderByDescending(p => p.RecordedAt)
            .FirstOrDefaultAsync();

        return MapToDto(coin, latestPrice);
    }

    public async Task<bool> DeleteCoinAsync(int id)
    {
        var coin = await _db.CryptoCoins.FindAsync(id);
        if (coin is null) return false;

        _db.CryptoCoins.Remove(coin);
        await _db.SaveChangesAsync();
        return true;
    }

    // ──────────────────────────────── Ціни ───────────────────────────────────

    public async Task<List<CryptoPriceDto>> GetPricesAsync(
        int coinId, DateTime? from, DateTime? to, int limit = 100)
    {
        var query = _db.CryptoPrices
            .Include(p => p.CryptoCoin)
            .Where(p => p.CryptoCoinId == coinId);

        if (from.HasValue) query = query.Where(p => p.RecordedAt >= from.Value);
        if (to.HasValue)   query = query.Where(p => p.RecordedAt <= to.Value);

        return await query
            .OrderByDescending(p => p.RecordedAt)
            .Take(limit)
            .Select(p => new CryptoPriceDto
            {
                Id = p.Id,
                CryptoCoinId = p.CryptoCoinId,
                CoinName = p.CryptoCoin.Name,
                Symbol = p.CryptoCoin.Symbol,
                Price = p.Price,
                MarketCap = p.MarketCap,
                Volume24h = p.Volume24h,
                PriceChange24h = p.PriceChange24h,
                RecordedAt = p.RecordedAt
            })
            .ToListAsync();
    }

    public async Task SavePriceAsync(
        int coinId, decimal price, decimal? marketCap,
        decimal? volume24h, decimal? priceChange24h)
    {
        _db.CryptoPrices.Add(new CryptoPrice
        {
            CryptoCoinId = coinId,
            Price = price,
            MarketCap = marketCap,
            Volume24h = volume24h,
            PriceChange24h = priceChange24h,
            RecordedAt = DateTime.UtcNow
        });
        await _db.SaveChangesAsync();
    }

    // ──────────────────────────────── Агрегація ───────────────────────────────

    public async Task<CoinStatsDto?> GetStatsAsync(
        int coinId, DateTime? from, DateTime? to)
    {
        var coin = await _db.CryptoCoins.FindAsync(coinId);
        if (coin is null) return null;

        var query = _db.CryptoPrices.Where(p => p.CryptoCoinId == coinId);

        if (from.HasValue) query = query.Where(p => p.RecordedAt >= from.Value);
        if (to.HasValue)   query = query.Where(p => p.RecordedAt <= to.Value);

        var count = await query.CountAsync();
        if (count == 0)
        {
            return new CoinStatsDto
            {
                CoinId = coin.Id,
                CoinName = coin.Name,
                Symbol = coin.Symbol,
                RecordsCount = 0
            };
        }

        // Агрегація через LINQ → перекладається в SQL
        var stats = await query.GroupBy(_ => 1).Select(g => new
        {
            MinPrice = g.Min(p => p.Price),
            MaxPrice = g.Max(p => p.Price),
            AvgPrice = g.Average(p => p.Price),
            MinMarketCap = g.Min(p => p.MarketCap),
            MaxMarketCap = g.Max(p => p.MarketCap),
            AvgMarketCap = g.Average(p => p.MarketCap),
            AvgVolume = g.Average(p => p.Volume24h)
        }).FirstAsync();

        // Останні 100 точок для графіка
        var history = await query
            .OrderByDescending(p => p.RecordedAt)
            .Take(100)
            .Select(p => new PricePointDto
            {
                RecordedAt = p.RecordedAt,
                Price = p.Price
            })
            .ToListAsync();

        history.Reverse(); // хронологічний порядок для графіка

        var latestPrice = await _db.CryptoPrices
            .Where(p => p.CryptoCoinId == coinId)
            .OrderByDescending(p => p.RecordedAt)
            .Select(p => (decimal?)p.Price)
            .FirstOrDefaultAsync();

        return new CoinStatsDto
        {
            CoinId = coin.Id,
            CoinName = coin.Name,
            Symbol = coin.Symbol,
            MinPrice = stats.MinPrice,
            MaxPrice = stats.MaxPrice,
            AvgPrice = stats.AvgPrice,
            LatestPrice = latestPrice,
            MinMarketCap = stats.MinMarketCap,
            MaxMarketCap = stats.MaxMarketCap,
            AvgMarketCap = stats.AvgMarketCap,
            AvgVolume24h = stats.AvgVolume,
            RecordsCount = count,
            From = from,
            To = to,
            PriceHistory = history
        };
    }

    // ── Маппер ────────────────────────────────────────────────────────────────

    private static CryptoCoinDto MapToDto(CryptoCoin coin, CryptoPrice? latest) =>
        new()
        {
            Id = coin.Id,
            CoinGeckoId = coin.CoinGeckoId,
            Symbol = coin.Symbol,
            Name = coin.Name,
            IsTracked = coin.IsTracked,
            AddedAt = coin.AddedAt,
            LatestPrice = latest?.Price,
            PriceChange24h = latest?.PriceChange24h
        };
}
