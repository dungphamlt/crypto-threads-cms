import { NextResponse } from "next/server";

// Mock data based on the provided structure
const mockCategories = {
  Categories: {
    Insights: [
      "Market Analysis",
      "Industry Reports",
      "Economic Trends",
      "Investment Insights",
    ],
    Learn: [
      "Trading Basics",
      "Technical Analysis",
      "Risk Management",
      "Portfolio Strategy",
    ],
    Trading: ["Forex", "Stocks", "Crypto", "Commodities"],
  },
};

export async function GET() {
  try {
    return NextResponse.json({
      success: true,
      data: mockCategories,
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: "Failed to fetch categories" },
      { status: 500 }
    );
  }
}
