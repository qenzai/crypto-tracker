using CryptoTracker.API.Models;
using Microsoft.EntityFrameworkCore;

namespace CryptoTracker.API.Data;

public class AppDbContext : DbContext
{
    public AppDbContext(DbContextOptions<AppDbContext> options) : base(options) { }

    public DbSet<User> Users => Set<User>();
    public DbSet<CryptoCoin> CryptoCoins => Set<CryptoCoin>();
    public DbSet<CryptoPrice> CryptoPrices => Set<CryptoPrice>();

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);

        // ── User ──────────────────────────────────────────────
        modelBuilder.Entity<User>(entity =>
        {
            entity.HasIndex(u => u.Email).IsUnique();
            entity.HasIndex(u => u.Username).IsUnique();
        });

        // ── CryptoCoin ────────────────────────────────────────
        modelBuilder.Entity<CryptoCoin>(entity =>
        {
            entity.HasIndex(c => c.CoinGeckoId).IsUnique();

            entity.HasMany(c => c.Prices)
                  .WithOne(p => p.CryptoCoin)
                  .HasForeignKey(p => p.CryptoCoinId)
                  .OnDelete(DeleteBehavior.Cascade);
        });

        // ── CryptoPrice ───────────────────────────────────────
        modelBuilder.Entity<CryptoPrice>(entity =>
        {
            entity.HasIndex(p => p.RecordedAt);
            entity.HasIndex(p => new { p.CryptoCoinId, p.RecordedAt });
        });

        // ── Seed: топ-50 монет за ринковою капіталізацією ────
        // Фіксована дата — обов'язково для EF Core seed (не можна DateTime.UtcNow)
        var seedDate = new DateTime(2024, 1, 1, 0, 0, 0, DateTimeKind.Utc);

        modelBuilder.Entity<CryptoCoin>().HasData(
            new CryptoCoin { Id =  1, CoinGeckoId = "bitcoin",                Symbol = "BTC",   Name = "Bitcoin",              IsTracked = true, AddedAt = seedDate },
            new CryptoCoin { Id =  2, CoinGeckoId = "ethereum",               Symbol = "ETH",   Name = "Ethereum",             IsTracked = true, AddedAt = seedDate },
            new CryptoCoin { Id =  3, CoinGeckoId = "tether",                 Symbol = "USDT",  Name = "Tether",               IsTracked = true, AddedAt = seedDate },
            new CryptoCoin { Id =  4, CoinGeckoId = "binancecoin",            Symbol = "BNB",   Name = "BNB",                  IsTracked = true, AddedAt = seedDate },
            new CryptoCoin { Id =  5, CoinGeckoId = "solana",                 Symbol = "SOL",   Name = "Solana",               IsTracked = true, AddedAt = seedDate },
            new CryptoCoin { Id =  6, CoinGeckoId = "usd-coin",               Symbol = "USDC",  Name = "USD Coin",             IsTracked = true, AddedAt = seedDate },
            new CryptoCoin { Id =  7, CoinGeckoId = "ripple",                 Symbol = "XRP",   Name = "XRP",                  IsTracked = true, AddedAt = seedDate },
            new CryptoCoin { Id =  8, CoinGeckoId = "staked-ether",           Symbol = "STETH", Name = "Lido Staked Ether",    IsTracked = true, AddedAt = seedDate },
            new CryptoCoin { Id =  9, CoinGeckoId = "dogecoin",               Symbol = "DOGE",  Name = "Dogecoin",             IsTracked = true, AddedAt = seedDate },
            new CryptoCoin { Id = 10, CoinGeckoId = "cardano",                Symbol = "ADA",   Name = "Cardano",              IsTracked = true, AddedAt = seedDate },
            new CryptoCoin { Id = 11, CoinGeckoId = "avalanche-2",            Symbol = "AVAX",  Name = "Avalanche",            IsTracked = true, AddedAt = seedDate },
            new CryptoCoin { Id = 12, CoinGeckoId = "tron",                   Symbol = "TRX",   Name = "TRON",                 IsTracked = true, AddedAt = seedDate },
            new CryptoCoin { Id = 13, CoinGeckoId = "chainlink",              Symbol = "LINK",  Name = "Chainlink",            IsTracked = true, AddedAt = seedDate },
            new CryptoCoin { Id = 14, CoinGeckoId = "polkadot",               Symbol = "DOT",   Name = "Polkadot",             IsTracked = true, AddedAt = seedDate },
            new CryptoCoin { Id = 15, CoinGeckoId = "matic-network",          Symbol = "MATIC", Name = "Polygon",              IsTracked = true, AddedAt = seedDate },
            new CryptoCoin { Id = 16, CoinGeckoId = "shiba-inu",              Symbol = "SHIB",  Name = "Shiba Inu",            IsTracked = true, AddedAt = seedDate },
            new CryptoCoin { Id = 17, CoinGeckoId = "litecoin",               Symbol = "LTC",   Name = "Litecoin",             IsTracked = true, AddedAt = seedDate },
            new CryptoCoin { Id = 18, CoinGeckoId = "dai",                    Symbol = "DAI",   Name = "Dai",                  IsTracked = true, AddedAt = seedDate },
            new CryptoCoin { Id = 19, CoinGeckoId = "uniswap",                Symbol = "UNI",   Name = "Uniswap",              IsTracked = true, AddedAt = seedDate },
            new CryptoCoin { Id = 20, CoinGeckoId = "bitcoin-cash",           Symbol = "BCH",   Name = "Bitcoin Cash",         IsTracked = true, AddedAt = seedDate },
            new CryptoCoin { Id = 21, CoinGeckoId = "stellar",                Symbol = "XLM",   Name = "Stellar",              IsTracked = true, AddedAt = seedDate },
            new CryptoCoin { Id = 22, CoinGeckoId = "internet-computer",      Symbol = "ICP",   Name = "Internet Computer",    IsTracked = true, AddedAt = seedDate },
            new CryptoCoin { Id = 23, CoinGeckoId = "cosmos",                 Symbol = "ATOM",  Name = "Cosmos",               IsTracked = true, AddedAt = seedDate },
            new CryptoCoin { Id = 24, CoinGeckoId = "ethereum-classic",       Symbol = "ETC",   Name = "Ethereum Classic",     IsTracked = true, AddedAt = seedDate },
            new CryptoCoin { Id = 25, CoinGeckoId = "monero",                 Symbol = "XMR",   Name = "Monero",               IsTracked = true, AddedAt = seedDate },
            new CryptoCoin { Id = 26, CoinGeckoId = "okb",                    Symbol = "OKB",   Name = "OKB",                  IsTracked = true, AddedAt = seedDate },
            new CryptoCoin { Id = 27, CoinGeckoId = "filecoin",               Symbol = "FIL",   Name = "Filecoin",             IsTracked = true, AddedAt = seedDate },
            new CryptoCoin { Id = 28, CoinGeckoId = "hedera-hashgraph",       Symbol = "HBAR",  Name = "Hedera",               IsTracked = true, AddedAt = seedDate },
            new CryptoCoin { Id = 29, CoinGeckoId = "lido-dao",               Symbol = "LDO",   Name = "Lido DAO",             IsTracked = true, AddedAt = seedDate },
            new CryptoCoin { Id = 30, CoinGeckoId = "arbitrum",               Symbol = "ARB",   Name = "Arbitrum",             IsTracked = true, AddedAt = seedDate },
            new CryptoCoin { Id = 31, CoinGeckoId = "vechain",                Symbol = "VET",   Name = "VeChain",              IsTracked = true, AddedAt = seedDate },
            new CryptoCoin { Id = 32, CoinGeckoId = "the-open-network",       Symbol = "TON",   Name = "Toncoin",              IsTracked = true, AddedAt = seedDate },
            new CryptoCoin { Id = 33, CoinGeckoId = "near",                   Symbol = "NEAR",  Name = "NEAR Protocol",        IsTracked = true, AddedAt = seedDate },
            new CryptoCoin { Id = 34, CoinGeckoId = "algorand",               Symbol = "ALGO",  Name = "Algorand",             IsTracked = true, AddedAt = seedDate },
            new CryptoCoin { Id = 35, CoinGeckoId = "the-graph",              Symbol = "GRT",   Name = "The Graph",            IsTracked = true, AddedAt = seedDate },
            new CryptoCoin { Id = 36, CoinGeckoId = "fantom",                 Symbol = "FTM",   Name = "Fantom",               IsTracked = true, AddedAt = seedDate },
            new CryptoCoin { Id = 37, CoinGeckoId = "aave",                   Symbol = "AAVE",  Name = "Aave",                 IsTracked = true, AddedAt = seedDate },
            new CryptoCoin { Id = 38, CoinGeckoId = "elrond-erd-2",           Symbol = "EGLD",  Name = "MultiversX",           IsTracked = true, AddedAt = seedDate },
            new CryptoCoin { Id = 39, CoinGeckoId = "eos",                    Symbol = "EOS",   Name = "EOS",                  IsTracked = true, AddedAt = seedDate },
            new CryptoCoin { Id = 40, CoinGeckoId = "theta-token",            Symbol = "THETA", Name = "Theta Network",        IsTracked = true, AddedAt = seedDate },
            new CryptoCoin { Id = 41, CoinGeckoId = "optimism",               Symbol = "OP",    Name = "Optimism",             IsTracked = true, AddedAt = seedDate },
            new CryptoCoin { Id = 42, CoinGeckoId = "maker",                  Symbol = "MKR",   Name = "Maker",                IsTracked = true, AddedAt = seedDate },
            new CryptoCoin { Id = 43, CoinGeckoId = "the-sandbox",            Symbol = "SAND",  Name = "The Sandbox",          IsTracked = true, AddedAt = seedDate },
            new CryptoCoin { Id = 44, CoinGeckoId = "axie-infinity",          Symbol = "AXS",   Name = "Axie Infinity",        IsTracked = true, AddedAt = seedDate },
            new CryptoCoin { Id = 45, CoinGeckoId = "decentraland",           Symbol = "MANA",  Name = "Decentraland",         IsTracked = true, AddedAt = seedDate },
            new CryptoCoin { Id = 46, CoinGeckoId = "flow",                   Symbol = "FLOW",  Name = "Flow",                 IsTracked = true, AddedAt = seedDate },
            new CryptoCoin { Id = 47, CoinGeckoId = "chiliz",                 Symbol = "CHZ",   Name = "Chiliz",               IsTracked = true, AddedAt = seedDate },
            new CryptoCoin { Id = 48, CoinGeckoId = "curve-dao-token",        Symbol = "CRV",   Name = "Curve DAO Token",      IsTracked = true, AddedAt = seedDate },
            new CryptoCoin { Id = 49, CoinGeckoId = "synthetix-network-token",Symbol = "SNX",   Name = "Synthetix",            IsTracked = true, AddedAt = seedDate },
            new CryptoCoin { Id = 50, CoinGeckoId = "pancakeswap-token",      Symbol = "CAKE",  Name = "PancakeSwap",          IsTracked = true, AddedAt = seedDate }
        );
    }
}
