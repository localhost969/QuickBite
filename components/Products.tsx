import ProductCard from './ProductCard';

interface Product {
  id: string;
  name: string;
  category: string;
  price: number;
  description: string;
  is_available: boolean;
  image_url?: string | null;
}

// Sample product data - replace with actual API call
const sampleProducts: Product[] = [
  {
    id: '1',
    name: 'Biryani',
    category: 'Rice',
    price: 150,
    description: 'Fragrant basmati rice cooked with aromatic spices',
    is_available: true,
    image_url: '/biryani.avif',
  },
  {
    id: '2',
    name: 'Butter Chicken',
    category: 'Chicken',
    price: 180,
    description: 'Tender chicken in creamy tomato-based sauce',
    is_available: true,
    image_url: '/butter-chicken.jpg',
  },
  {
    id: '3',
    name: 'Chole Bhature',
    category: 'Indian',
    price: 120,
    description: 'Spiced chickpeas with fluffy fried bread',
    is_available: true,
    image_url: '/Chole-Bhature.jpg',
  },
  {
    id: '4',
    name: 'Paneer Tikka',
    category: 'Vegetarian',
    price: 140,
    description: 'Marinated cottage cheese grilled to perfection',
    is_available: true,
    image_url: '/paneer.jpeg',
  },
  {
    id: '5',
    name: 'Dal Makhani',
    category: 'Vegetarian',
    price: 130,
    description: 'Creamy black lentils slow-cooked overnight',
    is_available: true,
    image_url: '/dal.webp',
  },
  {
    id: '6',
    name: 'Tandoori Chicken',
    category: 'Chicken',
    price: 160,
    description: 'Marinated and roasted chicken with traditional spices',
    is_available: false,
    image_url: '/tan.jpg',
  },
];

export default function Products() {
  return (
    <section className="space-y-8">
      <div>
        <h2 className="font-display font-bold text-4xl text-black mb-3">
          Today's Menu
        </h2>
        <p className="text-gray-600 font-sans text-lg">
          Fresh and delicious meals available now
        </p>
      </div>
      {sampleProducts.length === 0 ? (
        <div className="text-center py-16">
          <p className="text-gray-600 font-sans text-lg">No products available</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {sampleProducts.map((product) => (
            <ProductCard key={product.id} {...product} />
          ))}
        </div>
      )}
    </section>
  );
}
