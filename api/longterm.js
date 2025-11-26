import express from "express";
import cors from "cors";

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Root route – Status check
app.get("/", (req, res) => {
  res.json({
    ok: true,
    message: "InvestMyMillion API is live.",
  });
});

// ================== LONG-TERM MODEL (existing) ==================

app.post("/longterm", (req, res) => {
  const { amount, risk, duration } = req.body || {};

  if (!amount || !risk || !duration) {
    return res.json({
      ok: false,
      error: "Missing values. Please provide amount, risk, and duration.",
    });
  }

  const baseGrowthRate =
    risk === "high"
      ? 0.15
      : risk === "low"
      ? 0.05
      : 0.1; // Medium risk = 10%

  const years = duration / 12;
  const projectedValue = Math.round(amount * Math.pow(1 + baseGrowthRate, years));

  res.json({
    ok: true,
    input: { amount, risk, duration },
    projectedValue,
    note:
      "This is a basic demo model. Real InvestMyMillion models will be more advanced.",
  });
});

// ================== SIMPLE STOCK PICKER (v1 – offline universe) ==================

const SIMPLE_STOCK_UNIVERSE = [
  // Lower risk / defensive
  {
    ticker: "MSFT",
    name: "Microsoft",
    region: "USA",
    sector: "Technology",
    risk: "low",
    profile: "Mega-cap, diversified, strong cash flow and cloud/AI exposure.",
  },
  {
    ticker: "JNJ",
    name: "Johnson & Johnson",
    region: "USA",
    sector: "Healthcare",
    risk: "low",
    profile: "Defensive healthcare, long dividend history.",
  },
  {
    ticker: "VUSA",
    name: "Vanguard S&P 500 UCITS ETF",
    region: "UK",
    sector: "ETF",
    risk: "low",
    profile: "Broad US market exposure in a single ETF.",
  },

  // Medium risk / quality growth
  {
    ticker: "AAPL",
    name: "Apple",
    region: "USA",
    sector: "Technology",
    risk: "medium",
    profile: "Consumer ecosystem, services and strong brand.",
  },
  {
    ticker: "NVDA",
    name: "NVIDIA",
    region: "USA",
    sector: "Semiconductors",
    risk: "medium",
    profile: "Key player in AI chips and data centres.",
  },
  {
    ticker: "ASML",
    name: "ASML Holding",
    region: "EU",
    sector: "Semiconductors",
    risk: "medium",
    profile: "Critical equipment supplier for chip manufacturing.",
  },

  // Higher risk / aggressive growth
  {
    ticker: "TSLA",
    name: "Tesla",
    region: "USA",
    sector: "Automotive / Energy",
    risk: "high",
    profile: "Growth stock with higher volatility in EV and energy.",
  },
  {
    ticker: "SHOP",
    name: "Shopify",
    region: "USA",
    sector: "E-Commerce",
    risk: "high",
    profile: "E-commerce infrastructure with higher growth potential.",
  },
  {
    ticker: "SOXL",
    name: "Direxion Daily Semiconductor Bull 3x",
    region: "USA",
    sector: "ETF (Leveraged)",
    risk: "high",
    profile: "Very high risk leveraged semiconductor ETF.",
  },
];

function simpleSelectStocks(risk) {
  return SIMPLE_STOCK_UNIVERSE.filter((s) => {
    if (risk === "low") return s.risk === "low";
    if (risk === "high") return s.risk === "high";
    return s.risk === "medium" || s.risk === "low";
  }).slice(0, 3);
}

app.post("/stockpicks", (req, res) => {
  const { budget, risk, horizon } = req.body || {};

  if (!budget || !risk || !horizon) {
    return res.json({
      ok: false,
      error: "Missing values. Please provide budget, risk, and horizon.",
    });
  }

  const picks = simpleSelectStocks(risk);
  const perStock = Math.round(budget / picks.length);

  const enhancedPicks = picks.map((stock) => ({
    ...stock,
    suggestedAllocation: perStock,
  }));

  res.json({
    ok: true,
    input: { budget, risk, horizon },
    picks: enhancedPicks,
    note:
      "These are example ideas only – not financial advice. Always do your own research before investing.",
  });
});

// ================== LIVE STOCK PICKER (v2 – with market data) ==================

// Universe focused on markets commonly available on eToro & Trading 212
const LIVE_STOCK_UNIVERSE = {
  USA: [
    {
      ticker: "MSFT",
      name: "Microsoft",
      sector: "Technology",
      risk: "low",
    },
    {
      ticker: "AAPL",
      name: "Apple",
      sector: "Technology",
      risk: "medium",
    },
    {
      ticker: "NVDA",
      name: "NVIDIA",
      sector: "Semiconductors",
      risk: "medium",
    },
    {
      ticker: "TSLA",
      name: "Tesla",
      sector: "Automotive / Energy",
      risk: "high",
    },
    {
      ticker: "SHOP",
      name: "Shopify",
      sector: "E-Commerce",
      risk: "high",
    },
  ],
  UK: [
    {
      ticker: "LLOY.L",
      name: "Lloyds Banking Group",
      sector: "Banking",
      risk: "low",
    },
    {
      ticker: "ULVR.L",
      name: "Unilever",
      sector: "Consumer Staples",
      risk: "low",
    },
    {
      ticker: "RR.L",
      name: "Rolls-Royce Holdings",
      sector: "Aerospace & Defence",
      risk: "medium",
    },
    {
      ticker: "BARC.L",
      name: "Barclays",
      sector: "Banking",
      risk: "medium",
    },
    {
      ticker: "SMT.L",
      name: "Scottish Mortgage Investment Trust",
      sector: "Investment Trust",
      risk: "high",
    },
  ],
  SAUDI: [
    {
      ticker: "2222.SR",
      name: "Saudi Aramco",
      sector: "Energy",
      risk: "low",
    },
    {
      ticker: "1120.SR",
      name: "Al Rajhi Bank",
      sector: "Banking",
      risk: "low",
    },
    {
      ticker: "2010.SR",
      name: "SABIC",
      sector: "Materials",
      risk: "medium",
    },
  ],
};

// Helper: get latest price from Alpha Vantage (or similar)
async function getLatestPrice(symbol) {
  const apiKey = process.env.ALPHA_VANTAGE_KEY;
  if (!apiKey) {
    throw new Error("Missing ALPHA_VANTAGE_KEY environment variable");
  }

  const url = https://www.alphavantage.co/query?function=GLOBAL_QUOTE&symbol=${symbol}&apikey=${apiKey};

  const response = await fetch(url);
  if (!response.ok) {
    throw new Error("Market data API error");
  }

  const data = await response.json();
  const priceString = data["Global Quote"]?.["05. price"];

  if (!priceString) {
    throw new Error("Price not available for " + symbol);
  }

  const price = parseFloat(priceString);
  if (isNaN(price)) {
    throw new Error("Invalid price for " + symbol);
  }

  return price;
}

function pickUniverseByRisk(regionKey, risk) {
  const stocks = LIVE_STOCK_UNIVERSE[regionKey] || LIVE_STOCK_UNIVERSE.USA;

  return stocks.filter((s) => {
    if (risk === "low") return s.risk === "low";
    if (risk === "high") return s.risk === "high";
    return s.risk === "medium" || s.risk === "low";
  }).slice(0, 3);
}

app.post("/stockpicks-live", async (req, res) => {
  const { budget, risk, horizon, region } = req.body || {};

  if (!budget || !risk || !horizon || !region) {
    return res.json({
      ok: false,
      error: "Missing values. Please provide budget, risk, horizon, and region.",
    });
  }

  const regionKey = region.toUpperCase(); // "USA" | "UK" | "SAUDI"
  const candidates = pickUniverseByRisk(regionKey, risk);

  if (!candidates.length) {
    return res.json({
      ok: false,
      error: "No candidates found for this combination. Try a different risk level.",
    });
  }

  const perStockBudget = budget / candidates.length;
  const picks = [];

  for (const stock of candidates) {
    try {
      const price = await getLatestPrice(stock.ticker);
      const approxShares = Math.floor(perStockBudget / price);

      picks.push({
        ...stock,
        region: regionKey,
        price,
        suggestedBudget: Math.round(perStockBudget),
        approxShares,
      });
    } catch (err) {
      // Skip stocks that fail to fetch
      console.error("Error fetching price for", stock.ticker, err.message);
    }
  }

  if (!picks.length) {
    return res.json({
      ok: false,
      error: "Could not fetch live prices. Please try again later.",
    });
  }

  res.json({
    ok: true,
    input: { budget, risk, horizon, region: regionKey },
    picks,
    note:
      "Based on live prices from the market data API. Instruments are chosen from markets commonly tradable on eToro and Trading 212. This is not financial advice.",
  });
});

// ================== SERVER START ==================

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log("InvestMyMillion API running on port " + PORT);
});
