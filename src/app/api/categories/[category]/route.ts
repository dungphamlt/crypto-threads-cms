import { NextResponse } from "next/server";

const mockCategoryData = {
  insights: {
    name: "Insights",
    description: "Phân tích thị trường và báo cáo chuyên sâu",
    subcategories: [
      {
        name: "Market Analysis",
        slug: "market-analysis",
        description: "Phân tích xu hướng thị trường tài chính",
        postCount: 25,
      },
      {
        name: "Industry Reports",
        slug: "industry-reports",
        description: "Báo cáo ngành và phân tích doanh nghiệp",
        postCount: 18,
      },
      {
        name: "Economic Trends",
        slug: "economic-trends",
        description: "Xu hướng kinh tế vĩ mô và vi mô",
        postCount: 32,
      },
      {
        name: "Investment Insights",
        slug: "investment-insights",
        description: "Góc nhìn đầu tư và chiến lược tài chính",
        postCount: 41,
      },
    ],
  },
  learn: {
    name: "Learn",
    description: "Kiến thức cơ bản và nâng cao về trading",
    subcategories: [
      {
        name: "Trading Basics",
        slug: "trading-basics",
        description: "Kiến thức cơ bản về giao dịch",
        postCount: 35,
      },
      {
        name: "Technical Analysis",
        slug: "technical-analysis",
        description: "Phân tích kỹ thuật và biểu đồ",
        postCount: 28,
      },
      {
        name: "Risk Management",
        slug: "risk-management",
        description: "Quản lý rủi ro trong đầu tư",
        postCount: 22,
      },
      {
        name: "Portfolio Strategy",
        slug: "portfolio-strategy",
        description: "Chiến lược xây dựng danh mục đầu tư",
        postCount: 19,
      },
    ],
  },
  trading: {
    name: "Trading",
    description: "Các loại hình giao dịch và thị trường",
    subcategories: [
      {
        name: "Forex",
        slug: "forex",
        description: "Giao dịch ngoại hối",
        postCount: 45,
      },
      {
        name: "Stocks",
        slug: "stocks",
        description: "Giao dịch cổ phiếu",
        postCount: 38,
      },
      {
        name: "Crypto",
        slug: "crypto",
        description: "Giao dịch tiền điện tử",
        postCount: 52,
      },
      {
        name: "Commodities",
        slug: "commodities",
        description: "Giao dịch hàng hóa",
        postCount: 16,
      },
    ],
  },
};

export async function GET(
  request: Request,
  { params }: { params: { category: string } }
) {
  try {
    const category = params.category.toLowerCase();
    const categoryData =
      mockCategoryData[category as keyof typeof mockCategoryData];

    if (!categoryData) {
      return NextResponse.json(
        { success: false, error: "Category not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: categoryData,
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: "Failed to fetch category data" },
      { status: 500 }
    );
  }
}
