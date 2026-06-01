import ProductCard from './ProductCard';

export default function ProductListing({ products, onBuyNow }) {
  if (products.length === 0) {
    return (
      <div className="text-center py-20">
        <div className="text-gray-500 text-6xl mb-4">🔍</div>
        <h3 className="text-2xl font-semibold text-white mb-2">No products found</h3>
        <p className="text-gray-400">Try adjusting your search or filter criteria</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
      {products.map((product) => (
        <ProductCard key={product.id} product={product} onBuyNow={onBuyNow} />
      ))}
    </div>
  );
}