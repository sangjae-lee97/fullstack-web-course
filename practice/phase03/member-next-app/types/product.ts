
export type Product = {
  id: number;
  name: string;
  price: number;
  category: string;
  stock: number;
};

export type CartItem = Product & {
  quantity: number;
};
