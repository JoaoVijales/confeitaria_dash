export interface OrderItem {
  productId: string;
  name: string;
  quantity: number;
  price: number;
}

export interface Order {
  id: string;
  customerName: string;
  customerEmail: string;
  orderDate: string;
  total: number;
  status: string;
  items: OrderItem[];
}

export interface Product {
  id: string;
  name: string;
  category: string;
  price: number;
  stock: number;
}

export interface Customer {
  id: string;
  name: string;
  email: string;
  phone: string;
  is_vip: boolean;
  birthday: string | null;
  last_purchase: string | null;
  total_orders: number;
  total_spent: number;
  segment: string;
}

export const dailySales = {
  total: 1250.75,
};

export const openOrders = {
  count: 12,
};

export const topSellingProduct = {
  name: 'Bolo de Chocolate',
};

export const weeklySalesData = [
  { day: 'Seg', sales: 400 },
  { day: 'Ter', sales: 300 },
  { day: 'Qua', sales: 600 },
  { day: 'Qui', sales: 800 },
  { day: 'Sex', sales: 700 },
  { day: 'Sáb', sales: 1100 },
  { day: 'Dom', sales: 1300 },
];

export const topProductsData = [
  { name: 'Bolo de Chocolate', value: 400 },
  { name: 'Torta de Morango', value: 300 },
  { name: 'Cupcake Baunilha', value: 300 },
  { name: 'Donut', value: 200 },
];

export const dailySalesData = [
  { value: 100 },
  { value: 200 },
  { value: 150 },
  { value: 300 },
  { value: 250 },
  { value: 400 },
  { value: 350 },
];

export const openOrdersData = [
  { value: 5 },
  { value: 7 },
  { value: 6 },
  { value: 8 },
  { value: 7 },
  { value: 9 },
  { value: 12 },
];

export const topSellingProductData = [
  { value: 10 },
  { value: 15 },
  { value: 12 },
  { value: 18 },
  { value: 20 },
  { value: 25 },
  { value: 22 },
];

export const weeklyQuantityData = [
  { day: 'Seg', value: 100 },
  { day: 'Ter', value: 80 },
  { day: 'Qua', value: 120 },
  { day: 'Qui', value: 150 },
  { day: 'Sex', value: 140 },
  { day: 'Sáb', value: 200 },
  { day: 'Dom', value: 250 },
];

export const weeklyProfitData = [
  { day: 'Seg', value: 200 },
  { day: 'Ter', value: 150 },
  { day: 'Qua', value: 300 },
  { day: 'Qui', value: 400 },
  { day: 'Sex', value: 350 },
  { day: 'Sáb', value: 550 },
  { day: 'Dom', value: 650 },
];

export const allOrders: Order[] = [
    {
        id: "ORD001",
        customerName: "João Silva",
        customerEmail: "joao.silva@example.com",
        orderDate: "2025-09-28",
        total: 78.50,
        status: "Entregue",
        items: [
            { productId: "PROD001", name: "Bolo de Chocolate", quantity: 1, price: 50.00 },
            { productId: "PROD003", name: "Cupcake Baunilha", quantity: 2, price: 14.25 }
        ]
    },
    {
        id: "ORD002",
        customerName: "Maria Oliveira",
        customerEmail: "maria.o@example.com",
        orderDate: "2025-09-28",
        total: 45.00,
        status: "Pendente",
        items: [
            { productId: "PROD002", name: "Torta de Morango", quantity: 1, price: 45.00 }
        ]
    },
    {
        id: "ORD003",
        customerName: "Carlos Pereira",
        customerEmail: "carlos.p@example.com",
        orderDate: "2025-09-27",
        total: 120.00,
        status: "Enviado",
        items: [
            { productId: "PROD001", name: "Bolo de Chocolate", quantity: 2, price: 50.00 },
            { productId: "PROD004", name: "Donut", quantity: 4, price: 5.00 }
        ]
    },
    {
        id: "ORD004",
        customerName: "Ana Costa",
        customerEmail: "ana.c@example.com",
        orderDate: "2025-09-27",
        total: 32.90,
        status: "Entregue",
        items: [
            { productId: "PROD003", name: "Cupcake Baunilha", quantity: 3, price: 14.25 }
        ]
    },
    {
        id: "ORD005",
        customerName: "Pedro Santos",
        customerEmail: "pedro.s@example.com",
        orderDate: "2025-09-26",
        total: 95.00,
        status: "Processando",
        items: [
            { productId: "PROD002", name: "Torta de Morango", quantity: 1, price: 45.00 },
            { productId: "PROD001", name: "Bolo de Chocolate", quantity: 1, price: 50.00 }
        ]
    },
];

export const allProducts: Product[] = [
    { id: "PROD001", name: "Bolo de Chocolate", category: "Bolos", price: 50.00, stock: 15 },
    { id: "PROD002", name: "Torta de Morango", category: "Tortas", price: 45.00, stock: 10 },
    { id: "PROD003", name: "Cupcake Baunilha", category: "Cupcakes", price: 14.25, stock: 30 },
    { id: "PROD004", name: "Donut", category: "Doces", price: 5.00, stock: 50 },
    { id: "PROD005", name: "Macaron", category: "Doces", price: 7.50, stock: 20 },
];

export const allCustomers: Customer[] = [
    { id: "CUST001", name: "João Silva", email: "joao.silva@example.com", phone: "(11) 98765-4321", is_vip: true, birthday: null, total_orders: 5, total_spent: 350.00, last_purchase: "2025-09-28", segment: "Recorrente" },
    { id: "CUST002", name: "Maria Oliveira", email: "maria.o@example.com", phone: "(21) 91234-5678", is_vip: false, birthday: null, total_orders: 3, total_spent: 120.00, last_purchase: "2025-09-27", segment: "Novo" },
    { id: "CUST003", name: "Carlos Pereira", email: "carlos.p@example.com", phone: "(31) 99876-1234", is_vip: true, birthday: null, total_orders: 7, total_spent: 500.00, last_purchase: "2025-09-26", segment: "VIP" },
    { id: "CUST004", name: "Ana Costa", email: "ana.c@example.com", phone: "(41) 91122-3344", is_vip: false, birthday: null, total_orders: 2, total_spent: 80.00, last_purchase: "2025-09-25", segment: "Recorrente" },
];

export const monthlyClientGrowth = [
  { month: 'Jan', clients: 10 },
  { month: 'Fev', clients: 12 },
  { month: 'Mar', clients: 15 },
  { month: 'Abr', clients: 18 },
  { month: 'Mai', clients: 22 },
  { month: 'Jun', clients: 25 },
  { month: 'Jul', clients: 28 },
  { month: 'Ago', clients: 30 },
  { month: 'Set', clients: 35 },
  { month: 'Out', clients: 38 },
  { month: 'Nov', clients: 42 },
  { month: 'Dez', clients: 45 },
];