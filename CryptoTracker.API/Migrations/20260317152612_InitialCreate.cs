using System;
using Microsoft.EntityFrameworkCore.Metadata;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

#pragma warning disable CA1814 // Prefer jagged arrays over multidimensional

namespace CryptoTracker.API.Migrations
{
    /// <inheritdoc />
    public partial class InitialCreate : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AlterDatabase()
                .Annotation("MySql:CharSet", "utf8mb4");

            migrationBuilder.CreateTable(
                name: "CryptoCoins",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("MySql:ValueGenerationStrategy", MySqlValueGenerationStrategy.IdentityColumn),
                    CoinGeckoId = table.Column<string>(type: "varchar(100)", maxLength: 100, nullable: false)
                        .Annotation("MySql:CharSet", "utf8mb4"),
                    Symbol = table.Column<string>(type: "varchar(20)", maxLength: 20, nullable: false)
                        .Annotation("MySql:CharSet", "utf8mb4"),
                    Name = table.Column<string>(type: "varchar(100)", maxLength: 100, nullable: false)
                        .Annotation("MySql:CharSet", "utf8mb4"),
                    IsTracked = table.Column<bool>(type: "tinyint(1)", nullable: false),
                    AddedAt = table.Column<DateTime>(type: "datetime(6)", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_CryptoCoins", x => x.Id);
                })
                .Annotation("MySql:CharSet", "utf8mb4");

            migrationBuilder.CreateTable(
                name: "Users",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("MySql:ValueGenerationStrategy", MySqlValueGenerationStrategy.IdentityColumn),
                    Username = table.Column<string>(type: "varchar(50)", maxLength: 50, nullable: false)
                        .Annotation("MySql:CharSet", "utf8mb4"),
                    Email = table.Column<string>(type: "varchar(100)", maxLength: 100, nullable: false)
                        .Annotation("MySql:CharSet", "utf8mb4"),
                    PasswordHash = table.Column<string>(type: "longtext", nullable: false)
                        .Annotation("MySql:CharSet", "utf8mb4"),
                    CreatedAt = table.Column<DateTime>(type: "datetime(6)", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Users", x => x.Id);
                })
                .Annotation("MySql:CharSet", "utf8mb4");

            migrationBuilder.CreateTable(
                name: "CryptoPrices",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("MySql:ValueGenerationStrategy", MySqlValueGenerationStrategy.IdentityColumn),
                    CryptoCoinId = table.Column<int>(type: "int", nullable: false),
                    Price = table.Column<decimal>(type: "decimal(20,8)", nullable: false),
                    MarketCap = table.Column<decimal>(type: "decimal(30,2)", nullable: true),
                    Volume24h = table.Column<decimal>(type: "decimal(30,2)", nullable: true),
                    PriceChange24h = table.Column<decimal>(type: "decimal(10,4)", nullable: true),
                    RecordedAt = table.Column<DateTime>(type: "datetime(6)", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_CryptoPrices", x => x.Id);
                    table.ForeignKey(
                        name: "FK_CryptoPrices_CryptoCoins_CryptoCoinId",
                        column: x => x.CryptoCoinId,
                        principalTable: "CryptoCoins",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                })
                .Annotation("MySql:CharSet", "utf8mb4");

            migrationBuilder.InsertData(
                table: "CryptoCoins",
                columns: new[] { "Id", "AddedAt", "CoinGeckoId", "IsTracked", "Name", "Symbol" },
                values: new object[,]
                {
                    { 1, new DateTime(2026, 3, 17, 15, 26, 11, 794, DateTimeKind.Utc).AddTicks(4104), "bitcoin", true, "Bitcoin", "BTC" },
                    { 2, new DateTime(2026, 3, 17, 15, 26, 11, 794, DateTimeKind.Utc).AddTicks(4106), "ethereum", true, "Ethereum", "ETH" },
                    { 3, new DateTime(2026, 3, 17, 15, 26, 11, 794, DateTimeKind.Utc).AddTicks(4108), "solana", true, "Solana", "SOL" },
                    { 4, new DateTime(2026, 3, 17, 15, 26, 11, 794, DateTimeKind.Utc).AddTicks(4109), "binancecoin", true, "BNB", "BNB" },
                    { 5, new DateTime(2026, 3, 17, 15, 26, 11, 794, DateTimeKind.Utc).AddTicks(4111), "cardano", true, "Cardano", "ADA" }
                });

            migrationBuilder.CreateIndex(
                name: "IX_CryptoCoins_CoinGeckoId",
                table: "CryptoCoins",
                column: "CoinGeckoId",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_CryptoPrices_CryptoCoinId_RecordedAt",
                table: "CryptoPrices",
                columns: new[] { "CryptoCoinId", "RecordedAt" });

            migrationBuilder.CreateIndex(
                name: "IX_CryptoPrices_RecordedAt",
                table: "CryptoPrices",
                column: "RecordedAt");

            migrationBuilder.CreateIndex(
                name: "IX_Users_Email",
                table: "Users",
                column: "Email",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_Users_Username",
                table: "Users",
                column: "Username",
                unique: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "CryptoPrices");

            migrationBuilder.DropTable(
                name: "Users");

            migrationBuilder.DropTable(
                name: "CryptoCoins");
        }
    }
}
