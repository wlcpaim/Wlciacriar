// WLC Store Test - Camada de Dados e Estado Local (localStorage)
const STORAGE_KEYS = {
  PRODUCTS: 'wlc_store_products_v1',
  CART: 'wlc_store_cart_v1',
  ORDERS: 'wlc_store_orders_v1'
};

const INITIAL_PRODUCTS = [
  {
    id: 'prod-1',
    name: 'Teclado Mecânico Pro Wireless',
    slug: 'teclado-mecanico-pro-wireless',
    category: 'Periféricos',
    price: 49990, // em centavos
    stock: 15,
    rating: 4.8,
    reviewsCount: 42,
    image: 'https://images.unsplash.com/photo-1587829741301-dc798b83add3?auto=format&fit=crop&w=600&q=80',
    description: 'Teclado mecânico 75% hot-swappable com switches customizados, conexão tri-mode (Bluetooth 5.1, 2.4GHz e USB-C) e iluminação RGB por tecla.'
  },
  {
    id: 'prod-2',
    name: 'Mouse Ergonômico Vertical Master',
    slug: 'mouse-ergonomico-vertical-master',
    category: 'Periféricos',
    price: 28900,
    stock: 24,
    rating: 4.9,
    reviewsCount: 38,
    image: 'https://images.unsplash.com/photo-1615663245857-ac93bb7c39e7?auto=format&fit=crop&w=600&q=80',
    description: 'Projetado para reduzir a tensão no punho, sensor de alta precisão de 4000 DPI com ajuste de sensibilidade por botão dedicado.'
  },
  {
    id: 'prod-3',
    name: 'Monitor UltraWide Curvo 34" 144Hz',
    slug: 'monitor-ultrawide-curvo-34-144hz',
    category: 'Monitores',
    price: 279900,
    stock: 5,
    rating: 4.7,
    reviewsCount: 19,
    image: 'https://images.unsplash.com/photo-1527443224154-c4a3942d3acf?auto=format&fit=crop&w=600&q=80',
    description: 'Resolução UWQHD 3440x1440p, painel IPS curvo 1500R, taxa de atualização de 144Hz e tempo de resposta de 1ms.'
  },
  {
    id: 'prod-4',
    name: 'Headset Gamer Surround 7.1',
    slug: 'headset-gamer-surround-7-1',
    category: 'Áudio',
    price: 35900,
    stock: 12,
    rating: 4.6,
    reviewsCount: 27,
    image: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=600&q=80',
    description: 'Áudio posicional imersivo, almofadas em tecido respirável com memória de forma e microfone com cancelamento de ruído ativo.'
  },
  {
    id: 'prod-5',
    name: 'Suporte de Alumínio para Notebook',
    slug: 'suporte-de-aluminio-para-notebook',
    category: 'Acessórios',
    price: 14900,
    stock: 30,
    rating: 4.9,
    reviewsCount: 56,
    image: 'https://images.unsplash.com/photo-1527864550417-7fd91fc51a46?auto=format&fit=crop&w=600&q=80',
    description: 'Construído em liga de alumínio escovado com 6 níveis de ajuste de altura e excelente dissipação térmica passiva.'
  },
  {
    id: 'prod-6',
    name: 'Hub USB-C 7-em-1 Premium',
    slug: 'hub-usb-c-7-em-1-premium',
    category: 'Acessórios',
    price: 21900,
    stock: 18,
    rating: 4.5,
    reviewsCount: 14,
    image: 'https://images.unsplash.com/photo-1544652478-6553e5828a23?auto=format&fit=crop&w=600&q=80',
    description: 'Porta HDMI 4K@60Hz, leitor de cartões SD/TF, 3 portas USB 3.0 e Power Delivery de até 100W.'
  }
];

export const StoreDB = {
  getProducts() {
    const data = localStorage.getItem(STORAGE_KEYS.PRODUCTS);
    if (!data) {
      localStorage.setItem(STORAGE_KEYS.PRODUCTS, JSON.stringify(INITIAL_PRODUCTS));
      return INITIAL_PRODUCTS;
    }
    return JSON.parse(data);
  },

  saveProducts(products) {
    localStorage.setItem(STORAGE_KEYS.PRODUCTS, JSON.stringify(products));
  },

  getProductBySlug(slug) {
    const products = this.getProducts();
    return products.find(p => p.slug === slug);
  },

  getCart() {
    const data = localStorage.getItem(STORAGE_KEYS.CART);
    return data ? JSON.parse(data) : { items: [], coupon: null };
  },

  saveCart(cart) {
    localStorage.setItem(STORAGE_KEYS.CART, JSON.stringify(cart));
  },

  addToCart(productId, quantity = 1) {
    const products = this.getProducts();
    const product = products.find(p => p.id === productId);
    if (!product || product.stock < quantity) return false;

    const cart = this.getCart();
    const existing = cart.items.find(i => i.productId === productId);

    if (existing) {
      existing.quantity += quantity;
    } else {
      cart.items.push({ productId, quantity });
    }

    this.saveCart(cart);
    return true;
  },

  updateCartQuantity(productId, quantity) {
    const cart = this.getCart();
    if (quantity <= 0) {
      cart.items = cart.items.filter(i => i.productId !== productId);
    } else {
      const item = cart.items.find(i => i.productId === productId);
      if (item) item.quantity = quantity;
    }
    this.saveCart(cart);
  },

  clearCart() {
    localStorage.setItem(STORAGE_KEYS.CART, JSON.stringify({ items: [], coupon: null }));
  },

  getOrders() {
    const data = localStorage.getItem(STORAGE_KEYS.ORDERS);
    return data ? JSON.parse(data) : [];
  },

  createOrder(orderData) {
    const orders = this.getOrders();
    const newOrder = {
      id: 'WLC-' + Math.floor(100000 + Math.random() * 900000),
      createdAt: new Date().toISOString(),
      status: 'Aguardando Pagamento',
      ...orderData
    };
    orders.unshift(newOrder);
    localStorage.setItem(STORAGE_KEYS.ORDERS, JSON.stringify(orders));

    // Baixa de estoque atômica
    const products = this.getProducts();
    for (const item of newOrder.items) {
      const prod = products.find(p => p.id === item.productId);
      if (prod) {
        prod.stock = Math.max(0, prod.stock - item.quantity);
      }
    }
    this.saveProducts(products);
    this.clearCart();

    return newOrder;
  },

  updateOrderStatus(orderId, status) {
    const orders = this.getOrders();
    const order = orders.find(o => o.id === orderId);
    if (order) {
      order.status = status;
      localStorage.setItem(STORAGE_KEYS.ORDERS, JSON.stringify(orders));
      return true;
    }
    return false;
  }
};

export function formatBRL(cents) {
  return (cents / 100).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
}
