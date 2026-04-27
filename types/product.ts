export type Product = {
  id?: string
  user_id?: string
  title: string
  description: string
  categories: string[]
  brands: string[]
  condition: string
  price: number
  hashtags: string[]
  images?: string[]
}
