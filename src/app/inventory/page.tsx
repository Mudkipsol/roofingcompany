'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import {
  Search,
  ShoppingCart,
  Plus,
  Minus,
  Filter,
  ArrowLeft,
  Lock
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { useCart } from '@/context/CartContext';
import Image from 'next/image';

// Categories in exact specified order
const CATEGORIES = [
  { id: 'shingles', name: 'Shingles', hasSubcategories: true },
  { id: 'underlayment', name: 'Underlayment', hasSubcategories: false },
  { id: 'hip-and-ridge', name: 'Hip and Ridge', hasSubcategories: true },
  { id: 'ice-and-water', name: 'Ice and Water', hasSubcategories: false },
  { id: 'drip-edge', name: 'Drip Edge and Gutter Apron', hasSubcategories: false },
  { id: 'ventilation', name: 'Ventilation', hasSubcategories: false },
  { id: 'flashings', name: 'Flashings', hasSubcategories: false },
  { id: 'accessories', name: 'Accessories', hasSubcategories: false },
  { id: 'nails', name: 'Nails', hasSubcategories: false },
  { id: 'paint-caulking', name: 'Paint and Caulking', hasSubcategories: false },
  { id: 'valley-metal', name: 'Valley Metal', hasSubcategories: false }
];

// Brands for categories with subcategories
const BRANDS = {
  shingles: [
    {
      id: 'certainteed',
      name: 'CertainTeed',
      image: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=600',
      logo: 'https://images.unsplash.com/photo-1560472354-b33ff0c44a43?w=200&h=100&fit=crop'
    },
    {
      id: 'atlas',
      name: 'Atlas',
      image: 'https://images.unsplash.com/photo-1632478023417-22e475dbc5bd?w=600',
      logo: 'https://images.unsplash.com/photo-1560472354-b33ff0c44a43?w=200&h=100&fit=crop'
    },
    {
      id: 'gaf',
      name: 'GAF',
      image: 'https://images.unsplash.com/photo-1565193566173-7a0ee3dbe261?w=600',
      logo: 'https://images.unsplash.com/photo-1560472354-b33ff0c44a43?w=200&h=100&fit=crop'
    }
  ],
  'hip-and-ridge': [
    {
      id: 'certainteed',
      name: 'CertainTeed',
      image: 'https://images.unsplash.com/photo-1614564079675-2c8395264878?w=600',
      logo: 'https://images.unsplash.com/photo-1560472354-b33ff0c44a43?w=200&h=100&fit=crop'
    },
    {
      id: 'atlas',
      name: 'Atlas',
      image: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=600',
      logo: 'https://images.unsplash.com/photo-1560472354-b33ff0c44a43?w=200&h=100&fit=crop'
    }
  ]
};

// Products by brand
const PRODUCTS = {
  certainteed: {
    shingles: [
      {
        id: 'landmark',
        name: 'Landmark',
        image: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=600',
        startingPrice: 125.99,
        hasColors: true
      },
      {
        id: 'landmark-pro',
        name: 'Landmark Pro',
        image: 'https://images.unsplash.com/photo-1632478023417-22e475dbc5bd?w=600',
        startingPrice: 145.99,
        hasColors: true
      },
      {
        id: 'presidential-shake',
        name: 'Presidential Shake',
        image: 'https://images.unsplash.com/photo-1565193566173-7a0ee3dbe261?w=600',
        startingPrice: 185.99,
        hasColors: true
      }
    ],
    'hip-and-ridge': [
      {
        id: 'hip-ridge-shingles',
        name: 'Hip & Ridge Shingles',
        image: 'https://images.unsplash.com/photo-1614564079675-2c8395264878?w=600',
        startingPrice: 89.99,
        hasColors: true
      },
      {
        id: 'ridge-vent',
        name: 'Ridge Vent',
        image: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=600',
        startingPrice: 45.99,
        hasColors: true
      }
    ]
  },
  atlas: {
    shingles: [
      {
        id: 'prolam',
        name: 'ProLam',
        image: 'https://images.unsplash.com/photo-1565193566173-7a0ee3dbe261?w=600',
        startingPrice: 115.99,
        hasColors: true
      },
      {
        id: 'pinnacle',
        name: 'Pinnacle',
        image: 'https://images.unsplash.com/photo-1614564079675-2c8395264878?w=600',
        startingPrice: 135.99,
        hasColors: true
      },
      {
        id: 'storm-master',
        name: 'StormMaster',
        image: 'https://images.unsplash.com/photo-1632478023417-22e475dbc5bd?w=600',
        startingPrice: 149.99,
        hasColors: true
      }
    ],
    'hip-and-ridge': [
      {
        id: 'storm-master-ridge',
        name: 'StormMaster Ridge',
        image: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=600',
        startingPrice: 95.99,
        hasColors: true
      },
      {
        id: 'atlas-ridge-cap',
        name: 'Atlas Ridge Cap',
        image: 'https://images.unsplash.com/photo-1614564079675-2c8395264878?w=600',
        startingPrice: 78.99,
        hasColors: true
      }
    ]
  },
  gaf: {
    shingles: [
      {
        id: 'timberline',
        name: 'Timberline HD',
        image: 'https://images.unsplash.com/photo-1632478023417-22e475dbc5bd?w=600',
        startingPrice: 119.99,
        hasColors: true
      },
      {
        id: 'camelot',
        name: 'Camelot II',
        image: 'https://images.unsplash.com/photo-1565193566173-7a0ee3dbe261?w=600',
        startingPrice: 155.99,
        hasColors: true
      },
      {
        id: 'grand-sequoia',
        name: 'Grand Sequoia',
        image: 'https://images.unsplash.com/photo-1614564079675-2c8395264878?w=600',
        startingPrice: 225.99,
        hasColors: true
      }
    ]
  }
};

// Colors for products
const COLORS = {
  landmark: [
    { id: 'charcoal-black', name: 'Charcoal Black', hex: '#2C2C2C', price: 125.99, stock: 450 },
    { id: 'weathered-wood', name: 'Weathered Wood', hex: '#8B7355', price: 125.99, stock: 325 },
    { id: 'driftwood', name: 'Driftwood', hex: '#A0978C', price: 125.99, stock: 275 },
    { id: 'colonial-slate', name: 'Colonial Slate', hex: '#4A5568', price: 125.99, stock: 380 },
    { id: 'burnt-sienna', name: 'Burnt Sienna', hex: '#8B4513', price: 125.99, stock: 195 }
  ],
  'landmark-pro': [
    { id: 'charcoal-black', name: 'Charcoal Black', hex: '#2C2C2C', price: 145.99, stock: 200 },
    { id: 'weathered-wood', name: 'Weathered Wood', hex: '#8B7355', price: 145.99, stock: 150 },
    { id: 'pewter-gray', name: 'Pewter Gray', hex: '#696969', price: 145.99, stock: 175 },
    { id: 'storm-cloud', name: 'Storm Cloud', hex: '#778899', price: 145.99, stock: 125 }
  ],
  'presidential-shake': [
    { id: 'autumn-brown', name: 'Autumn Brown', hex: '#8B4513', price: 185.99, stock: 85 },
    { id: 'charcoal-black', name: 'Charcoal Black', hex: '#2C2C2C', price: 185.99, stock: 65 },
    { id: 'weathered-wood', name: 'Weathered Wood', hex: '#8B7355', price: 185.99, stock: 45 }
  ],
  'hip-ridge-shingles': [
    { id: 'charcoal-black', name: 'Charcoal Black', hex: '#2C2C2C', price: 89.99, stock: 150 },
    { id: 'weathered-wood', name: 'Weathered Wood', hex: '#8B7355', price: 89.99, stock: 125 },
    { id: 'storm-cloud', name: 'Storm Cloud', hex: '#778899', price: 89.99, stock: 95 }
  ],
  'ridge-vent': [
    { id: 'black', name: 'Black', hex: '#000000', price: 45.99, stock: 300 },
    { id: 'brown', name: 'Brown', hex: '#8B4513', price: 45.99, stock: 250 },
    { id: 'gray', name: 'Gray', hex: '#696969', price: 45.99, stock: 275 }
  ],
  prolam: [
    { id: 'charcoal-black', name: 'Charcoal Black', hex: '#2C2C2C', price: 115.99, stock: 320 },
    { id: 'weathered-wood', name: 'Weathered Wood', hex: '#8B7355', price: 115.99, stock: 285 },
    { id: 'storm-gray', name: 'Storm Gray', hex: '#708090', price: 115.99, stock: 205 },
    { id: 'burnt-sienna', name: 'Burnt Sienna', hex: '#8B4513', price: 115.99, stock: 165 }
  ],
  pinnacle: [
    { id: 'charcoal-black', name: 'Charcoal Black', hex: '#2C2C2C', price: 135.99, stock: 180 },
    { id: 'weathered-wood', name: 'Weathered Wood', hex: '#8B7355', price: 135.99, stock: 145 },
    { id: 'slate-gray', name: 'Slate Gray', hex: '#708090', price: 135.99, stock: 125 }
  ],
  'storm-master': [
    { id: 'charcoal-black', name: 'Charcoal Black', hex: '#2C2C2C', price: 149.99, stock: 95 },
    { id: 'weathered-wood', name: 'Weathered Wood', hex: '#8B7355', price: 149.99, stock: 75 },
    { id: 'storm-cloud', name: 'Storm Cloud', hex: '#778899', price: 149.99, stock: 85 }
  ],
  'storm-master-ridge': [
    { id: 'charcoal-black', name: 'Charcoal Black', hex: '#2C2C2C', price: 95.99, stock: 110 },
    { id: 'weathered-wood', name: 'Weathered Wood', hex: '#8B7355', price: 95.99, stock: 85 },
    { id: 'storm-gray', name: 'Storm Gray', hex: '#708090', price: 95.99, stock: 95 }
  ],
  'atlas-ridge-cap': [
    { id: 'charcoal-black', name: 'Charcoal Black', hex: '#2C2C2C', price: 78.99, stock: 185 },
    { id: 'weathered-wood', name: 'Weathered Wood', hex: '#8B7355', price: 78.99, stock: 155 },
    { id: 'brown', name: 'Brown', hex: '#8B4513', price: 78.99, stock: 165 }
  ],
  timberline: [
    { id: 'charcoal', name: 'Charcoal', hex: '#36454F', price: 119.99, stock: 275 },
    { id: 'pewter-gray', name: 'Pewter Gray', hex: '#696969', price: 119.99, stock: 235 },
    { id: 'shakewood', name: 'Shakewood', hex: '#8B7355', price: 119.99, stock: 195 },
    { id: 'weathered-wood', name: 'Weathered Wood', hex: '#8B7355', price: 119.99, stock: 215 }
  ],
  camelot: [
    { id: 'charcoal', name: 'Charcoal', hex: '#36454F', price: 155.99, stock: 145 },
    { id: 'pewter-gray', name: 'Pewter Gray', hex: '#696969', price: 155.99, stock: 125 },
    { id: 'royal-slate', name: 'Royal Slate', hex: '#2F4F4F', price: 155.99, stock: 95 }
  ],
  'grand-sequoia': [
    { id: 'charcoal', name: 'Charcoal', hex: '#36454F', price: 225.99, stock: 65 },
    { id: 'storm-cloud-gray', name: 'Storm Cloud Gray', hex: '#778899', price: 225.99, stock: 45 },
    { id: 'shakewood', name: 'Shakewood', hex: '#8B7355', price: 225.99, stock: 35 }
  ]
};

// Sample products for direct categories
const DIRECT_PRODUCTS = {
  underlayment: [
    {
      id: 'synthetic-underlayment',
      name: 'Synthetic Underlayment Roll',
      image: 'https://images.unsplash.com/photo-1564013799919-ab600027ffc6?w=600',
      price: 89.99,
      stock: 150,
      hasOptions: false
    },
    {
      id: 'felt-underlayment',
      name: 'Felt Underlayment #30',
      image: 'https://images.unsplash.com/photo-1632478023417-22e475dbc5bd?w=600',
      price: 45.99,
      stock: 200,
      hasOptions: false
    },
    {
      id: 'ice-water-shield',
      name: 'Ice & Water Shield',
      image: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=600',
      price: 125.99,
      stock: 85,
      hasOptions: false
    }
  ],
  'ice-and-water': [
    {
      id: 'ice-water-barrier',
      name: 'Self-Adhering Ice & Water Barrier',
      image: 'https://images.unsplash.com/photo-1614564079675-2c8395264878?w=600',
      price: 135.99,
      stock: 75,
      hasOptions: false
    },
    {
      id: 'modified-bitumen',
      name: 'Modified Bitumen Membrane',
      image: 'https://images.unsplash.com/photo-1565193566173-7a0ee3dbe261?w=600',
      price: 185.99,
      stock: 45,
      hasOptions: false
    }
  ],
  'drip-edge': [
    {
      id: 'aluminum-drip-edge',
      name: 'Aluminum Drip Edge - 10ft',
      image: 'https://images.unsplash.com/photo-1632478023417-22e475dbc5bd?w=600',
      price: 12.99,
      stock: 500,
      hasOptions: false
    },
    {
      id: 'galvanized-drip-edge',
      name: 'Galvanized Steel Drip Edge - 10ft',
      image: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=600',
      price: 15.99,
      stock: 350,
      hasOptions: false
    },
    {
      id: 'gutter-apron',
      name: 'Gutter Apron - 10ft',
      image: 'https://images.unsplash.com/photo-1564013799919-ab600027ffc6?w=600',
      price: 18.99,
      stock: 225,
      hasOptions: false
    }
  ],
  ventilation: [
    {
      id: 'ridge-vent-system',
      name: 'Ridge Vent System - 20ft',
      image: 'https://images.unsplash.com/photo-1614564079675-2c8395264878?w=600',
      price: 89.99,
      stock: 125,
      hasOptions: false
    },
    {
      id: 'soffit-vent',
      name: 'Continuous Soffit Vent - 8ft',
      image: 'https://images.unsplash.com/photo-1565193566173-7a0ee3dbe261?w=600',
      price: 25.99,
      stock: 275,
      hasOptions: false
    },
    {
      id: 'turbine-vent',
      name: 'Aluminum Turbine Vent',
      image: 'https://images.unsplash.com/photo-1632478023417-22e475dbc5bd?w=600',
      price: 45.99,
      stock: 85,
      hasOptions: false
    }
  ],
  flashings: [
    {
      id: 'step-flashing',
      name: 'Aluminum Step Flashing - 8"x10"',
      image: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=600',
      price: 2.85,
      stock: 1000,
      hasOptions: false
    },
    {
      id: 'pipe-boot',
      name: 'EPDM Pipe Boot - 1.5"',
      image: 'https://images.unsplash.com/photo-1614564079675-2c8395264878?w=600',
      price: 15.99,
      stock: 150,
      hasOptions: false
    },
    {
      id: 'valley-flashing',
      name: 'Galvanized Valley Flashing - 10ft',
      image: 'https://images.unsplash.com/photo-1565193566173-7a0ee3dbe261?w=600',
      price: 35.99,
      stock: 95,
      hasOptions: false
    }
  ],
  accessories: [
    {
      id: 'roof-cement',
      name: 'Roofing Cement - 10.3oz Tube',
      image: 'https://images.unsplash.com/photo-1632478023417-22e475dbc5bd?w=600',
      price: 8.99,
      stock: 300,
      hasOptions: false
    },
    {
      id: 'roofing-tape',
      name: 'Butyl Roofing Tape - 4"x25ft',
      image: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=600',
      price: 25.99,
      stock: 125,
      hasOptions: false
    },
    {
      id: 'roof-screws',
      name: 'Self-Drilling Roof Screws - 100 pack',
      image: 'https://images.unsplash.com/photo-1614564079675-2c8395264878?w=600',
      price: 18.99,
      stock: 250,
      hasOptions: false
    }
  ],
  nails: [
    {
      id: 'roofing-nails-125',
      name: 'Roofing Nails - 1.25" (50lb box)',
      image: 'https://images.unsplash.com/photo-1565193566173-7a0ee3dbe261?w=600',
      price: 89.99,
      stock: 75,
      hasOptions: false
    },
    {
      id: 'roofing-nails-175',
      name: 'Roofing Nails - 1.75" (50lb box)',
      image: 'https://images.unsplash.com/photo-1632478023417-22e475dbc5bd?w=600',
      price: 95.99,
      stock: 65,
      hasOptions: false
    },
    {
      id: 'cap-nails',
      name: 'Plastic Cap Nails - 1.5" (5lb box)',
      image: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=600',
      price: 45.99,
      stock: 150,
      hasOptions: false
    }
  ],
  'paint-caulking': [
    {
      id: 'exterior-caulk',
      name: 'Exterior Acrylic Caulk - Clear',
      image: 'https://images.unsplash.com/photo-1614564079675-2c8395264878?w=600',
      price: 6.99,
      stock: 200,
      hasOptions: false
    },
    {
      id: 'roof-coating',
      name: 'Elastomeric Roof Coating - 5 Gallon',
      image: 'https://images.unsplash.com/photo-1565193566173-7a0ee3dbe261?w=600',
      price: 185.99,
      stock: 25,
      hasOptions: false
    },
    {
      id: 'primer-sealer',
      name: 'Metal Roof Primer & Sealer - 1 Gallon',
      image: 'https://images.unsplash.com/photo-1632478023417-22e475dbc5bd?w=600',
      price: 45.99,
      stock: 85,
      hasOptions: false
    }
  ],
  'valley-metal': [
    {
      id: 'galvanized-valley',
      name: 'Galvanized Valley Metal - 10ft',
      image: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=600',
      price: 35.99,
      stock: 125,
      hasOptions: false
    },
    {
      id: 'aluminum-valley',
      name: 'Aluminum Valley Metal - 10ft',
      image: 'https://images.unsplash.com/photo-1614564079675-2c8395264878?w=600',
      price: 42.99,
      stock: 95,
      hasOptions: false
    },
    {
      id: 'copper-valley',
      name: 'Copper Valley Metal - 10ft',
      image: 'https://images.unsplash.com/photo-1565193566173-7a0ee3dbe261?w=600',
      price: 125.99,
      stock: 35,
      hasOptions: false
    }
  ]
};

type SortOption = 'sales' | 'price-low' | 'price-high';

export default function InventoryPage() {
  const router = useRouter();
  const { user } = useAuth();
  const { addToCart, items: cartItems, getTotalItems } = useCart();

  // Navigation state
  const [currentCategory, setCurrentCategory] = useState<string | null>(null);
  const [currentBrand, setCurrentBrand] = useState<string | null>(null);
  const [currentProduct, setCurrentProduct] = useState<string | null>(null);

  // Other state
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState<SortOption>('sales');
  const [quantities, setQuantities] = useState<{ [key: string]: number }>({});
  const [selectedColor, setSelectedColor] = useState<string>('');
  const [editMode, setEditMode] = useState(false);
  const [editPassword, setEditPassword] = useState('');
  const [showCartDrawer, setShowCartDrawer] = useState(false);

  // Get current view data
  const getCurrentViewData = () => {
    if (!currentCategory) {
      return { type: 'categories', data: CATEGORIES };
    }

    const category = CATEGORIES.find(c => c.id === currentCategory);
    if (!category) return { type: 'categories', data: CATEGORIES };

    if (category.hasSubcategories) {
      if (!currentBrand) {
        return { type: 'brands', data: BRANDS[currentCategory as keyof typeof BRANDS] || [] };
      }

      if (!currentProduct) {
        const products = PRODUCTS[currentBrand as keyof typeof PRODUCTS]?.[currentCategory as keyof typeof PRODUCTS[keyof typeof PRODUCTS]] || [];
        return { type: 'products', data: products };
      }

      const colors = COLORS[currentProduct as keyof typeof COLORS] || [];
      return { type: 'colors', data: colors };
    } else {
      const products = DIRECT_PRODUCTS[currentCategory as keyof typeof DIRECT_PRODUCTS] || [];
      return { type: 'direct-products', data: products };
    }
  };

  const currentView = getCurrentViewData();

  // Navigation functions
  const navigateToCategory = (categoryId: string) => {
    setCurrentCategory(categoryId);
    setCurrentBrand(null);
    setCurrentProduct(null);
    setSelectedColor('');
  };

  const navigateToBrand = (brandId: string) => {
    setCurrentBrand(brandId);
    setCurrentProduct(null);
    setSelectedColor('');
  };

  const navigateToProduct = (productId: string) => {
    setCurrentProduct(productId);
    setSelectedColor('');
  };

  const handleBack = () => {
    if (currentProduct) {
      setCurrentProduct(null);
      setSelectedColor('');
    } else if (currentBrand) {
      setCurrentBrand(null);
    } else if (currentCategory) {
      setCurrentCategory(null);
    }
  };

  // Cart functions
  const handleAddToCart = (productData: { id: string; name: string; price: number; image: string }) => {
    const quantity = quantities[productData.id] || 1;
    addToCart({
      id: `${productData.id}-${selectedColor || 'default'}`,
      name: selectedColor ? `${productData.name} - ${selectedColor}` : productData.name,
      price: productData.price,
      image: productData.image
    }, quantity);

    // Reset quantity and show success
    setQuantities(prev => ({ ...prev, [productData.id]: 1 }));

    // Show success toast (you can implement a proper toast system)
    alert('Added to cart. View Cart →');
  };

  const handleQuantityChange = (productId: string, change: number) => {
    setQuantities(prev => ({
      ...prev,
      [productId]: Math.max(1, (prev[productId] || 1) + change)
    }));
  };

  const getStockBadgeColor = (stock: number) => {
    if (stock === 0) return 'bg-red-500';
    if (stock > 100) return 'bg-green-500';
    if (stock > 50) return 'bg-yellow-500';
    return 'bg-red-500';
  };

  const getStockText = (stock: number) => {
    if (stock === 0) return 'Out of Stock';
    if (stock <= 15) return `Only ${stock} left`;
    return `${stock} in stock`;
  };

  // Breadcrumb generation
  const getBreadcrumbs = () => {
    const breadcrumbs = [{ label: 'Categories' }];

    if (currentCategory) {
      const category = CATEGORIES.find(c => c.id === currentCategory);
      breadcrumbs.push({ label: category?.name || '' });
    }

    if (currentBrand) {
      const brand = BRANDS[currentCategory as keyof typeof BRANDS]?.find(b => b.id === currentBrand);
      breadcrumbs.push({ label: brand?.name || '' });
    }

    if (currentProduct) {
      const product = PRODUCTS[currentBrand as keyof typeof PRODUCTS]?.[currentCategory as keyof typeof PRODUCTS[keyof typeof PRODUCTS]]?.find((p: { id: string; name: string }) => p.id === currentProduct);
      breadcrumbs.push({ label: product?.name || '' });
    }

    return breadcrumbs;
  };

  return (
    <>
      <Header />
      <div className="min-h-screen bg-gray-50">
        <div className="container mx-auto px-4 py-8">
          {/* Header Row */}
          <div className="flex items-start justify-between mb-8">
            <div>
              <h1 className="text-3xl font-bold mb-2">MBS Inventory</h1>
              <p className="text-gray-600">Professional roofing supplies in stock and ready to ship</p>
            </div>
            <div className="flex items-center gap-3">
              {/* Admin Edit Button */}
              {!editMode ? (
                <div className="flex items-center gap-2">
                  <Input
                    type="password"
                    placeholder="Admin password"
                    value={editPassword}
                    onChange={(e) => setEditPassword(e.target.value)}
                    className="w-32 h-9"
                  />
                  <Button
                    onClick={() => {
                      if (editPassword === 'MBS2024admin') {
                        setEditMode(true);
                      }
                    }}
                    variant="outline"
                    size="sm"
                    className="h-9 px-3"
                  >
                    <Lock className="w-4 h-4 mr-1" />
                    Admin Edit
                  </Button>
                </div>
              ) : (
                <Button
                  onClick={() => setEditMode(false)}
                  variant="outline"
                  size="sm"
                  className="h-9 px-3"
                >
                  Exit Edit Mode
                </Button>
              )}

              {/* View Cart Button */}
              <Button
                onClick={() => router.push('/cart')}
                variant="outline"
                size="sm"
                className="h-9 px-3 relative"
              >
                <ShoppingCart className="w-4 h-4 mr-1" />
                View Cart
                {getTotalItems() > 0 && (
                  <Badge className="absolute -top-2 -right-2 h-5 w-5 text-xs p-0 flex items-center justify-center bg-red-500">
                    {getTotalItems()}
                  </Badge>
                )}
              </Button>
            </div>
          </div>

          {/* Toolbar */}
          <div className="flex items-center justify-between mb-6">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                type="text"
                placeholder="Search products, brands..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <div className="flex items-center gap-4">
              <Select value={sortBy} onValueChange={(value: SortOption) => setSortBy(value)}>
                <SelectTrigger className="w-48">
                  <SelectValue placeholder="Sort by" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="sales">Sales</SelectItem>
                  <SelectItem value="price-low">Price (Low → High)</SelectItem>
                  <SelectItem value="price-high">Price (High → Low)</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Breadcrumbs */}
          {currentCategory && (
            <div className="flex items-center gap-2 mb-6">
              <Button variant="ghost" onClick={handleBack} className="p-2">
                <ArrowLeft className="h-4 w-4" />
              </Button>
              <div className="flex items-center gap-2 text-sm text-gray-600">
                {getBreadcrumbs().map((crumb, index) => (
                  <div key={index} className="flex items-center gap-2">
                    {index > 0 && <span>/</span>}
                    <span className={index === getBreadcrumbs().length - 1 ? 'font-semibold text-black' : ''}>
                      {crumb.label}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Main Content */}
          <div className="flex gap-8">
            {/* Left Sidebar - Categories */}
            <div className="w-80">
              <Card className="sticky top-4">
                <CardContent className="p-6">
                  <div className="flex items-center gap-2 mb-4">
                    <Filter className="h-4 w-4" />
                    <h3 className="font-semibold">Categories</h3>
                  </div>
                  <div className="space-y-1">
                    <Button
                      variant={!currentCategory ? "default" : "ghost"}
                      className={`w-full justify-start ${!currentCategory ? 'bg-red-500 hover:bg-red-600 text-white' : ''}`}
                      onClick={() => {
                        setCurrentCategory(null);
                        setCurrentBrand(null);
                        setCurrentProduct(null);
                        setSelectedColor('');
                      }}
                    >
                      All Categories
                    </Button>
                    {CATEGORIES.map((category) => (
                      <Button
                        key={category.id}
                        variant={currentCategory === category.id ? "default" : "ghost"}
                        className={`w-full justify-start ${
                          currentCategory === category.id ? 'bg-red-500 hover:bg-red-600 text-white' : ''
                        }`}
                        onClick={() => navigateToCategory(category.id)}
                      >
                        {category.name}
                      </Button>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Right Content Area */}
            <div className="flex-1">
              {/* Categories View */}
              {currentView.type === 'categories' && (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {CATEGORIES.map((category) => (
                    <Card
                      key={category.id}
                      className="cursor-pointer hover:shadow-lg transition-shadow overflow-hidden"
                      onClick={() => navigateToCategory(category.id)}
                    >
                      <div className="relative h-48 bg-gray-200">
                        <Image
                          src="https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=600"
                          alt={category.name}
                          fill
                          className="object-cover"
                        />
                        <div className="absolute inset-0 bg-black bg-opacity-40 flex items-center justify-center">
                          <h3 className="text-xl font-bold text-white text-center">{category.name}</h3>
                        </div>
                      </div>
                    </Card>
                  ))}
                </div>
              )}

              {/* Brands View */}
              {currentView.type === 'brands' && (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {(currentView.data as { id: string; name: string; image: string }[]).map((brand) => (
                    <Card
                      key={brand.id}
                      className="cursor-pointer hover:shadow-lg transition-shadow overflow-hidden"
                      onClick={() => navigateToBrand(brand.id)}
                    >
                      <div className="relative h-48">
                        <Image
                          src={brand.image}
                          alt={brand.name}
                          fill
                          className="object-cover"
                        />
                      </div>
                      <CardContent className="p-6 text-center">
                        <h3 className="text-xl font-bold">{brand.name}</h3>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}

              {/* Products View */}
              {currentView.type === 'products' && (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {(currentView.data as { id: string; name: string; image: string; startingPrice: number; hasColors: boolean }[]).map((product) => (
                    <Card key={product.id} className="overflow-hidden hover:shadow-lg transition-shadow">
                      <div className="relative h-48">
                        <Image
                          src={product.image}
                          alt={product.name}
                          fill
                          className="object-cover"
                        />
                      </div>
                      <CardContent className="p-4">
                        <h3 className="font-bold text-lg mb-2">{product.name}</h3>
                        <p className="text-gray-600 mb-3">Starting at ${product.startingPrice}</p>
                        <Button
                          className="w-full"
                          onClick={() => navigateToProduct(product.id)}
                        >
                          {product.hasColors ? 'Select Colors' : 'Select Options'}
                        </Button>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}

              {/* Colors/Variants View */}
              {currentView.type === 'colors' && (
                <div className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    {(currentView.data as { id: string; name: string; hex: string; price: number; stock: number }[]).map((color) => (
                      <Card
                        key={color.id}
                        className={`cursor-pointer transition-all ${
                          selectedColor === color.id ? 'ring-2 ring-red-500' : ''
                        }`}
                        onClick={() => setSelectedColor(color.id)}
                      >
                        <CardContent className="p-4">
                          <div
                            className="w-full h-16 rounded mb-3"
                            style={{ backgroundColor: color.hex }}
                          />
                          <h4 className="font-semibold text-sm">{color.name}</h4>
                          <p className="text-gray-600 text-sm">${color.price}</p>
                          <Badge className={getStockBadgeColor(color.stock)}>
                            {getStockText(color.stock)}
                          </Badge>
                        </CardContent>
                      </Card>
                    ))}
                  </div>

                  {selectedColor && (
                    <Card className="p-6">
                      <div className="flex items-center justify-between">
                        <div>
                          <h3 className="text-lg font-semibold mb-2">Add to Cart</h3>
                          <div className="flex items-center gap-4">
                            <div className="flex items-center gap-2">
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleQuantityChange(selectedColor, -1)}
                                disabled={(quantities[selectedColor] || 1) <= 1}
                              >
                                <Minus className="h-4 w-4" />
                              </Button>
                              <span className="w-8 text-center">{quantities[selectedColor] || 1}</span>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleQuantityChange(selectedColor, 1)}
                              >
                                <Plus className="h-4 w-4" />
                              </Button>
                            </div>
                          </div>
                        </div>
                        <Button
                          className="bg-red-500 hover:bg-red-600"
                          onClick={() => {
                            const colorData = (currentView.data as { id: string; name: string; hex: string; price: number; stock: number }[]).find(c => c.id === selectedColor);
                            const product = PRODUCTS[currentBrand as keyof typeof PRODUCTS]?.[currentCategory as keyof typeof PRODUCTS[keyof typeof PRODUCTS]]?.find((p: { id: string; name: string }) => p.id === currentProduct);

                            if (colorData && product) {
                              handleAddToCart({
                                id: `${currentProduct}-${selectedColor}`,
                                name: `${product.name} - ${colorData.name}`,
                                price: colorData.price,
                                image: product.image
                              });
                            }
                          }}
                        >
                          <ShoppingCart className="h-4 w-4 mr-2" />
                          Add to Cart
                        </Button>
                      </div>
                    </Card>
                  )}
                </div>
              )}

              {/* Direct Products View */}
              {currentView.type === 'direct-products' && (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {(currentView.data as { id: string; name: string; image: string; price: number; stock: number; hasOptions: boolean }[]).map((product) => (
                    <Card key={product.id} className="overflow-hidden hover:shadow-lg transition-shadow">
                      <div className="relative h-48">
                        <Image
                          src={product.image}
                          alt={product.name}
                          fill
                          className="object-cover"
                        />
                        <Badge className={`absolute top-2 right-2 ${getStockBadgeColor(product.stock)} text-white`}>
                          {getStockText(product.stock)}
                        </Badge>
                      </div>
                      <CardContent className="p-4">
                        <h3 className="font-bold text-lg mb-2">{product.name}</h3>
                        <p className="text-2xl font-bold text-green-600 mb-4">${product.price}</p>

                        {product.stock > 0 ? (
                          <div className="space-y-3">
                            <div className="flex items-center justify-between">
                              <span className="text-sm font-medium">Quantity:</span>
                              <div className="flex items-center gap-2">
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => handleQuantityChange(product.id, -1)}
                                  disabled={(quantities[product.id] || 1) <= 1}
                                >
                                  <Minus className="h-4 w-4" />
                                </Button>
                                <span className="w-8 text-center">{quantities[product.id] || 1}</span>
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => handleQuantityChange(product.id, 1)}
                                  disabled={(quantities[product.id] || 1) >= product.stock}
                                >
                                  <Plus className="h-4 w-4" />
                                </Button>
                              </div>
                            </div>
                            <Button
                              onClick={() => handleAddToCart(product)}
                              className="w-full bg-red-500 hover:bg-red-600"
                            >
                              <ShoppingCart className="h-4 w-4 mr-2" />
                              Add to Cart
                            </Button>
                          </div>
                        ) : (
                          <Button disabled className="w-full">
                            Out of Stock
                          </Button>
                        )}
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}

              {/* Empty State */}
              {currentView.data.length === 0 && (
                <div className="text-center py-12">
                  <ShoppingCart className="h-16 w-16 mx-auto text-gray-400 mb-4" />
                  <h3 className="text-xl font-semibold text-gray-600 mb-2">No Products Found</h3>
                  <p className="text-gray-500">Try adjusting your search or browse other categories.</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </>
  );
}
