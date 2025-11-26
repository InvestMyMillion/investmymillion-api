import express from "express";
import cors from "cors";

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// =====================
// Health check
// =====================
app.get("/", (req, res) => {
  res.json({
    ok: true,
    message: "InvestMyMillion API is live.",
  });
});

// =====================
// Long-term growth model
// =====================
app.post("/longterm", (req, res) => {
  const { amount, risk, duration } = req.body || {};

  if (!amount || !risk || !duration) {
    return res.json({
      ok: false,
      error: "Please provide amount, risk, and duration.",
    });
  }

  const baseGrowthRate =
    risk === "high"
      ? 0.15 // high risk
      : risk === "low"
      ? 0.05 // low risk
      : 0.1; // medium risk

  const years = duration / 12;
  const projectedValue = Math.round(
    amount * Math.pow(1 + baseGrowthRate, years)
  );

  res.json({
    ok: true,
    input: { amount, risk, duration },
    projectedValue,
    note:
      "This is a simplified demo projection. Real InvestMyMillion models will use deeper analysis and live data.",
  });
});

// =====================
// Stock universe
// (picked so they exist on eToro / Trading 212 style platforms)
// =====================
const STOCK_UNIVERSE = [
  // --- USA large caps (growth / balanced) ---
  {
    ticker: "MSFT",
    name: "Microsoft",
    region: "USA",
    sector: "Technology",
    risk: "low",
    style: "balanced",
    story: "Mega-cap tech with cloud, AI and strong cashflow.",
  },
  {
    ticker: "AAPL",
    name: "Apple",
    region: "USA",
    sector: "Technology",
    risk: "medium",
    style: "balanced",
    story: "iPhone ecosystem, strong brand and buybacks.",
  },
  {
    ticker: "NVDA",
    name: "NVIDIA",
    region: "USA",
    sector: "Semiconductors / AI",
    risk: "high",
    style: "growth",
    story: "Leader in GPUs and AI chips – high growth, high volatility.",
  },
  {
    ticker: "TSLA",
    name: "Tesla",
    region: "USA",
    sector: "EV / Energy",
    risk: "high",
    style: "growth",
    story: "Electric vehicles and energy storage – aggressive growth play.",
  },
  {
    ticker: "AMZN",
    name: "Amazon",
    region: "USA",
    sector: "E-commerce / Cloud",
    risk: "medium",
    style: "growth",
    story: "AWS + global e-commerce – long-term compounding business.",
  },
  {
    ticker: "KO",
    name: "Coca-Cola",
    region: "USA",
    sector: "Consumer Staples",
    risk: "low",
    style: "income",
    story: "Defensive dividend stock with global brand.",
  },

  // --- UK listed ---
  {
    ticker: "ULVR.L",
    name: "Unilever",
    region: "UK",
    sector: "Consumer Staples",
    risk: "low",
    style: "income",
    story: "Everyday brands with steady cashflow and dividends.",
  },
  {
    ticker: "LLOY.L",
    name: "Lloyds Bank",
    region: "UK",
    sector: "Banking",
    risk: "medium",
    style: "income",
    story: "UK bank leveraged to interest rates and housing market.",
  },
  {
    ticker: "BP.L",
    name: "BP",
    region: "UK",
    sector: "Energy",
    risk: "medium",
    style: "balanced",
    story: "Oil & gas with transition into renewables – cyclical but cash-rich.",
  },
  {
    ticker: "SMT.L",
    name: "Scottish Mortgage Trust",
    region: "UK",
    sector: "Investment Trust / Growth",
    risk: "high",
    style: "growth",
    story: "Tech-heavy global growth basket in one stock.",
  },

  // --- Saudi market ---
  {
    ticker: "2222.SR",
    name: "Saudi Aramco",
    region: "SAUDI",
    sector: "Energy",
    risk: "low",
    style: "income",
    story: "State-backed energy giant with strong dividends.",
  },
  {
    ticker: "2010.SR",
    name: "SABIC",
    region: "SAUDI",
    sector: "Materials / Chemicals",
    risk: "medium",
    style: "balanced",
    story: "Chemicals and materials play on global industrial demand.",
  },
  {
    ticker: "1120.SR",
    name: "Al Rajhi Bank",
    region: "SAUDI",
    sector: "Banking",
    risk: "low",
    style: "income",
    story: "Large Islamic bank with defensive characteristics.",
  },
];

// Helper: map horizon to style tilt
function horizonToTilt(horizon) {
  if (horizon === "short") return "income"; // safer
  if (horizon === "medium") return "balanced";
  return "growth"; // long term
}

// Simple scoring function to feel “AI-ish”
function scoreStock(stock, { risk, horizon, style }) {
  let score = 0;

  // Risk match
  if (risk === stock.risk) score += 2;
  else if (risk === "medium") score += 1;

  // Style match (growth / income / balanced)
  if (!style || style === stock.style) score += 2;

  // Horizon tilt
  const tilt = horizonToTilt(horizon);
  if (tilt === stock.style) score += 1;

  // Slight bonus to diversified / defensive sectors
  if (stock.sector.includes("Consumer") || stock.sector.includes("Bank"))
    score += 0.5;

  return score;
}

// =====================
// AI Stock Advisor endpoint
// =====================
app.post("/stockadvisor", (req, res) => {
  const { budget, risk, market, horizon, style } = req.body || {};

  if (!budget || !risk || !market || !horizon) {
    return res.json({
      ok: false,
      error: "Please provide budget, risk, market and horizon.",
    });
  }

  const normalisedMarket = market.toUpperCase();

  // Filter by region choice
  let candidates = STOCK_UNIVERSE.filter((s) => {
    if (normalisedMarket === "GLOBAL") return true;
    if (normalisedMarket === "USA") return s.region === "USA";
    if (normalisedMarket === "UK") return s.region === "UK";
    if (normalisedMarket === "SAUDI") return s.region === "SAUDI";
    return true;
  });

  if (!candidates.length) {
    candidates = STOCK_UNIVERSE;
  }

  // Score and sort
  const scored = candidates
    .map((stock) => ({
      ...stock,
      score: scoreStock(stock, { risk, horizon, style }),
    }))
    .sort((a, b) => b.score - a.score);

  // Pick top 3–6 depending on budget
  const count = budget < 1500 ? 3 : budget < 5000 ? 4 : 6;
  const picks = scored.slice(0, count);

  if (!picks.length) {
    return res.json({
      ok: false,
      error: "No suitable stocks found for this combination.",
    });
  }

  const perStock = Math.floor(budget / picks.length);

  res.json({
    ok: true,
    input: { budget, risk, market: normalisedMarket, horizon, style },
    allocationPerStock: perStock,
    picks: picks.map((p) => ({
      ticker: p.ticker,
      name: p.name,
      region: p.region,
      sector: p.sector,
      risk: p.risk,
      style: p.style,
      suggestedAllocation: perStock,
      story: p.story,
    })),
    disclaimer:
      "This is an educational model using example stocks that trade on platforms similar to eToro and Trading 212. This is not financial advice.",
  });
});

// =====================
// Start server
// =====================
const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log("InvestMyMillion API running on port " + PORT);
});
