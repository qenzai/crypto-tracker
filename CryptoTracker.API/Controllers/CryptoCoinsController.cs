using CryptoTracker.API.DTOs.Crypto;
using CryptoTracker.API.Services.CoinGecko;
using CryptoTracker.API.Services.Crypto;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace CryptoTracker.API.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class CryptoCoinsController : ControllerBase
{
    private readonly ICryptoPriceService _service;
    private readonly ICoinGeckoService _coinGecko;

    public CryptoCoinsController(ICryptoPriceService service, ICoinGeckoService coinGecko)
    {
        _service = service;
        _coinGecko = coinGecko;
    }

    /// <summary>
    /// Отримати всі монети з останніми цінами
    /// </summary>
    [HttpGet]
    [ProducesResponseType(typeof(List<CryptoCoinDto>), StatusCodes.Status200OK)]
    public async Task<IActionResult> GetAll()
    {
        var coins = await _service.GetAllCoinsAsync();
        return Ok(coins);
    }

    /// <summary>
    /// Отримати монету за ID
    /// </summary>
    [HttpGet("{id:int}")]
    [ProducesResponseType(typeof(CryptoCoinDto), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> GetById(int id)
    {
        var coin = await _service.GetCoinByIdAsync(id);
        return coin is null ? NotFound() : Ok(coin);
    }

    /// <summary>
    /// Пошук монет через CoinGecko API за назвою або символом
    /// </summary>
    [HttpGet("search")]
    [ProducesResponseType(StatusCodes.Status200OK)]
    public async Task<IActionResult> Search([FromQuery] string q)
    {
        if (string.IsNullOrWhiteSpace(q))
            return Ok(new List<object>());

        var results = await _coinGecko.SearchCoinsAsync(q);
        return Ok(results);
    }

    /// <summary>
    /// Додати нову монету для відстеження
    /// </summary>
    [HttpPost]
    [ProducesResponseType(typeof(CryptoCoinDto), StatusCodes.Status201Created)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    public async Task<IActionResult> Create([FromBody] CreateCoinDto dto)
    {
        if (!ModelState.IsValid)
            return BadRequest(ModelState);

        try
        {
            var coin = await _service.CreateCoinAsync(dto);
            return CreatedAtAction(nameof(GetById), new { id = coin.Id }, coin);
        }
        catch (InvalidOperationException ex)
        {
            return BadRequest(new { message = ex.Message });
        }
    }

    /// <summary>
    /// Оновити монету (назву або статус відстеження)
    /// </summary>
    [HttpPut("{id:int}")]
    [ProducesResponseType(typeof(CryptoCoinDto), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> Update(int id, [FromBody] UpdateCoinDto dto)
    {
        var coin = await _service.UpdateCoinAsync(id, dto);
        return coin is null ? NotFound() : Ok(coin);
    }

    /// <summary>
    /// Видалити монету та всю її цінову історію
    /// </summary>
    [HttpDelete("{id:int}")]
    [ProducesResponseType(StatusCodes.Status204NoContent)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> Delete(int id)
    {
        var deleted = await _service.DeleteCoinAsync(id);
        return deleted ? NoContent() : NotFound();
    }
}
