
import { Plus, Minus, Loader } from 'lucide-react';

interface ProductCardProps {
  id: string;
  name: string;
  price: number;
  category: string;
  image_url?: string | null;
  description: string;
  is_available: boolean;
  quantity?: number; // quantity in cart
  isLoading?: boolean; // loading state
  onAdd?: (id: string) => void;
  onRemove?: (id: string) => void;
}

export default function ProductCard({
  id,
  name,
  price,
  category,
  image_url,
  description,
  is_available,
  quantity,
  isLoading,
  onAdd,
  onRemove,
}: ProductCardProps) {
  return (
    <div className="bg-white border border-gray-200 rounded-xl overflow-hidden hover:shadow-md transition-shadow flex flex-col relative" style={{ minHeight: 370 }}>
      {/* Product Image */}
      <div className="aspect-square bg-gray-100 overflow-hidden">
        {image_url ? (
          <img
            src={image_url}
            alt={name}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-gray-400">
            No Image
          </div>
        )}
      </div>

      {/* Product Info */}
      <div className="p-4 pb-20 flex-1">
        <h3 className="font-semibold text-black mb-1">{name}</h3>
        <p className="text-sm text-gray-600 mb-3 line-clamp-2">{description}</p>
        <span className="text-xs px-2 py-1 bg-gray-100 rounded text-gray-600 absolute top-4 right-4">
          {category}
        </span>
      </div>

      {/* Fixed Bottom Bar */}
      <div className="absolute left-0 right-0 bottom-0 px-4 pb-4">
        <div className="bg-white rounded-lg shadow flex items-center justify-between gap-2 px-4 py-2 border border-gray-100">
          <span className="text-lg font-bold text-black">₹{price}</span>
          {is_available ? (
            quantity && quantity > 0 ? (
              <div className="flex items-center gap-2 ml-2">
                <button
                  onClick={onRemove ? () => onRemove(id) : undefined}
                  disabled={!!isLoading}
                  className="p-1.5 rounded-lg hover:bg-gray-100 transition-all"
                >
                  <Minus className="w-4 h-4 text-black" />
                </button>
                <span className="text-sm font-semibold text-black w-8 text-center">{quantity}</span>
                <button
                  onClick={onAdd ? () => onAdd(id) : undefined}
                  disabled={!!isLoading}
                  className="p-1.5 rounded-lg hover:bg-blue-100 transition-all"
                >
                  {isLoading ? <Loader className="w-4 h-4 animate-spin text-blue-600" /> : <Plus className="w-4 h-4 text-blue-600" />}
                </button>
              </div>
            ) : (
              <button
                onClick={onAdd ? () => onAdd(id) : undefined}
                disabled={!!isLoading}
                className="flex-1 py-2 rounded-lg font-medium flex items-center justify-center gap-2 transition-all ml-2 bg-blue-600 text-white hover:bg-blue-700"
              >
                {isLoading ? (
                  <Loader className="w-4 h-4 animate-spin" />
                ) : (
                  <>
                    <Plus className="w-4 h-4" />
                    <span>Add</span>
                  </>
                )}
              </button>
            )
          ) : (
            <button disabled className="flex-1 py-2 rounded-lg font-medium bg-gray-100 text-gray-400 ml-2">
              Not Available
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
