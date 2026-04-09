using CryptoTracker.API.DTOs.Crypto;
using CryptoTracker.API.Services.Crypto;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace CryptoTracker.API.Controllers;

// ══════════════════════════════════════════════════════════════════════════════
//  PRICES controller
// ══════════════════════════════════════════════════════════════════════════════

[ApiController]
[Route("api/coins/{coinId:int}/prices")]
[Authorize]
public class CryptoPricesController : ControllerBase
{
    private readonly ICryptoPriceService _service;

    public CryptoPricesController(ICryptoPriceService service) => _service = service;

    /// <summary>
    /// Отримати цінову історію монети з фільтрами
    /// </summary>
    /// <param name="coinId">ID монети</param>
    /// <param name="from">Початок діапазону (UTC)</param>
    /// <param name="to">Кінець діапазону (UTC)</param>
    /// <param name="limit">Максимальна кількість записів (за замовчуванням 100)</param>
    [HttpGet]
    [ProducesResponseType(typeof(List<CryptoPriceDto>), StatusCodes.Status200OK)]
    public async Task<IActionResult> GetPrices(
        int coinId,
        [FromQuery] DateTime? from = null,
        [FromQuery] DateTime? to = null,
        [FromQuery] int limit = 100)
    {
        var prices = await _service.GetPricesAsync(coinId, from, to, limit);
        return Ok(prices);
    }
}

// ══════════════════════════════════════════════════════════════════════════════
//  STATS controller
// ══════════════════════════════════════════════════════════════════════════════

[ApiController]
[Route("api/coins/{coinId:int}/stats")]
[Authorize]
public class StatsController : ControllerBase
{
    private readonly ICryptoPriceService _service;

    public StatsController(ICryptoPriceService service) => _service = service;

    /// <summary>
    /// Статистика по монеті: мін/макс/середнє ціни та маркет кап.
    /// Також повертає дані для графіка (price history).
    /// </summary>
    /// <param name="coinId">ID монети</param>
    /// <param name="from">Початок діапазону (UTC)</param>
    /// <param name="to">Кінець діапазону (UTC)</param>
    [HttpGet]
    [ProducesResponseType(typeof(CoinStatsDto), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> GetStats(
        int coinId,
        [FromQuery] DateTime? from = null,
        [FromQuery] DateTime? to = null)
    {
        var stats = await _service.GetStatsAsync(coinId, from, to);
        return stats is null ? NotFound() : Ok(stats);
    }
}
