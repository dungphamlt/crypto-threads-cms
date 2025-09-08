import { NextResponse } from "next/server";

const mockSubcategoryData = {
  insights: {
    "market-analysis": {
      name: "Market Analysis",
      description: "Phân tích xu hướng thị trường tài chính",
      posts: [
        {
          id: 1,
          title: "Phân tích thị trường Q1 2024",
          slug: "phan-tich-thi-truong-q1-2024",
          excerpt: "Tổng quan về xu hướng thị trường trong quý đầu năm...",
          publishedAt: "2024-02-20",
          views: 1250,
        },
        {
          id: 2,
          title: "Dự báo thị trường chứng khoán",
          slug: "du-bao-thi-truong-chung-khoan",
          excerpt: "Những yếu tố ảnh hưởng đến thị trường chứng khoán...",
          publishedAt: "2024-02-18",
          views: 890,
        },
      ],
    },
  },
  learn: {
    "trading-basics": {
      name: "Trading Basics",
      description: "Kiến thức cơ bản về giao dịch",
      posts: [
        {
          id: 3,
          title: "Cơ bản về giao dịch cho người mới",
          slug: "co-ban-ve-giao-dich",
          excerpt: "Hướng dẫn từ A-Z cho người mới bắt đầu giao dịch...",
          publishedAt: "2024-02-15",
          views: 2100,
        },
      ],
    },
  },
  trading: {
    forex: {
      name: "Forex",
      description: "Giao dịch ngoại hối",
      posts: [
        {
          id: 4,
          title: "Chiến lược giao dịch EUR/USD",
          slug: "chien-luoc-eur-usd",
          excerpt: "Phân tích và chiến lược giao dịch cặp tiền EUR/USD...",
          publishedAt: "2024-02-12",
          views: 1650,
        },
      ],
    },
  },
};

export async function GET(
  request: Request,
  { params }: { params: { category: string; subcategory: string } }
) {
  try {
    const category = params.category.toLowerCase();
    const subcategory = params.subcategory.toLowerCase();

    const categoryData =
      mockSubcategoryData[category as keyof typeof mockSubcategoryData];
    if (!categoryData) {
      return NextResponse.json(
        { success: false, error: "Category not found" },
        { status: 404 }
      );
    }

    const subcategoryData =
      categoryData[subcategory as keyof typeof categoryData];
    if (!subcategoryData) {
      return NextResponse.json(
        { success: false, error: "Subcategory not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: subcategoryData,
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: "Failed to fetch subcategory data" },
      { status: 500 }
    );
  }
}
