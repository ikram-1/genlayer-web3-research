import { NextRequest } from "next/server";

export async function GET(request: NextRequest) {
  const symbol = request.nextUrl.searchParams.get("symbol");

  if (!symbol) {
    return Response.json(
      { error: "Token symbol is required" },
      { status: 400 }
    );
  }

  const apiKey = process.env.CMC_API_KEY;

  if (!apiKey) {
    return Response.json(
      { error: "CMC_API_KEY is not configured" },
      { status: 500 }
    );
  }

  try {
    const response = await fetch(
      `https://pro-api.coinmarketcap.com/v2/cryptocurrency/quotes/latest?symbol=${symbol.toUpperCase()}`,
      {
        headers: {
          "X-CMC_PRO_API_KEY": apiKey,
          Accept: "application/json",
        },
        cache: "no-store",
      }
    );

    const data = await response.json();

    if (!response.ok) {
      return Response.json(
        {
          error:
            data?.status?.error_message ||
            "CMC API request failed",
        },
        { status: response.status }
      );
    }

    const tokens = data.data?.[symbol.toUpperCase()] || [];

    const token = tokens[0] || null;

    let performance = null;

    if (token?.id) {
      const performanceResponse = await fetch(
        `https://pro-api.coinmarketcap.com/v2/cryptocurrency/price-performance-stats/latest?id=${token.id}&time_period=all_time`,
        {
          headers: {
            "X-CMC_PRO_API_KEY": apiKey,
            Accept: "application/json",
          },
          cache: "no-store",
        }
      );

      const performanceData = await performanceResponse.json();

      console.log(
        "CMC PERFORMANCE DATA:",
        JSON.stringify(performanceData, null, 2)
      );

      if (performanceResponse.ok) {
        performance =
          performanceData?.data?.[String(token.id)]?.periods?.all_time?.quote?.USD ||
          null;
      }
    }

    if (!token) {
      return Response.json({
        found: false,
        symbol: symbol.toUpperCase(),
        message: `${symbol.toUpperCase()} was not found in CoinMarketCap's current market data.`,
      });
    }

    // Historical price data for chart
    let history = null;

    if (token?.id) {
      const historyResponse = await fetch(
        `https://pro-api.coinmarketcap.com/v3/cryptocurrency/quotes/historical?id=${token.id}&count=30&interval=daily&convert=USD`,
        {
          headers: {
            "X-CMC_PRO_API_KEY": apiKey,
            Accept: "application/json",
          },
          cache: "no-store",
        }
      );

      const historyData = await historyResponse.json();

      console.log(
        "CMC HISTORY DATA:",
        JSON.stringify(historyData, null, 2)
      );

      if (historyResponse.ok) {
        history =
          historyData?.data?.[String(token.id)]?.quotes || null;
      }
    }

    return Response.json({
      found: true,
      token,
      performance,
      history,
    });
  } catch (error) {
    console.error("CMC API error:", error);

    return Response.json(
      { error: "Unable to connect to CoinMarketCap" },
      { status: 500 }
    );
  }
}