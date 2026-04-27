export const mockProductA = {
  title: "E2E_モック商品_A",
  description:
    "テスト用説明です。200文字前後の長さの本文として仕様のレンジに入る想定の文章にしています。",
  categories: ["メンズ", "靴"],
  brands: ["テストブランド"],
  condition: "目立った傷なし",
  price: 1000,
  hashtags: ["#a", "#b", "#c"],
} as const

export const mockProductB = {
  ...mockProductA,
  title: "E2E_モック商品_B",
} as const
