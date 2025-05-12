import React, { useState, useEffect } from 'react';
import { Heart } from 'lucide-react';
import { supabase } from '../lib/supabase';
import toast from 'react-hot-toast';
import { Product } from '../types';

const Products = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadProducts();
  }, []);

  const loadProducts = async () => {
    try {
      const response = await fetch('/products.xml');
      const text = await response.text();
      const parser = new DOMParser();
      const xmlDoc = parser.parseFromString(text, 'text/xml');
      const productNodes = xmlDoc.getElementsByTagName('product');
      
      const parsedProducts: Product[] = Array.from(productNodes).map((node, index) => ({
        id: index + 1,
        name: node.getElementsByTagName('name')[0].textContent || '',
        price: parseFloat(node.getElementsByTagName('price')[0].textContent || '0'),
        description: node.getElementsByTagName('description')[0].textContent || '',
        image: node.getElementsByTagName('image')[0].textContent || '',
        category: node.getElementsByTagName('category')[0].textContent || '',
      }));

      setProducts(parsedProducts);
    } catch (error) {
      console.error('Error loading products:', error);
      toast.error('Failed to load products');
    } finally {
      setLoading(false);
    }
  };

  const addToWishlist = async (product: Product) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        toast.error('Please sign in to add items to your wishlist');
        return;
      }

      const { error } = await supabase
        .from('wishlist')
        .insert([{ user_id: user.id, product_id: product.id }]);

      if (error) throw error;
      toast.success('Added to wishlist!');
    } catch (error: any) {
      toast.error(error.message);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-t-2 border-b-2 border-indigo-500"></div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <h1 className="text-3xl font-bold text-gray-900 mb-8">Our Products</h1>
      
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
        {products.map((product) => (
          <div key={product.id} className="bg-white rounded-lg shadow-md overflow-hidden">
            <img
              src={product.image}
              alt={product.name}
              className="w-full h-64 object-cover"
            />
            <div className="p-6">
              <h2 className="text-xl font-semibold text-gray-900">{product.name}</h2>
              <p className="mt-2 text-gray-500">{product.category}</p>
              <p className="mt-2 text-2xl font-bold text-indigo-600">${product.price}</p>
              
              <div className="mt-4 flex justify-between items-center">
                <button
                  onClick={() => setSelectedProduct(product)}
                  className="bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                >
                  Show Details
                </button>
                <button
                  onClick={() => addToWishlist(product)}
                  className="text-gray-500 hover:text-red-500"
                >
                  <Heart className="h-6 w-6" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {selectedProduct && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg p-8 max-w-2xl w-full">
            <h2 className="text-2xl font-bold mb-4">{selectedProduct.name}</h2>
            <p className="text-gray-600 mb-4">{selectedProduct.description}</p>
            <p className="text-xl font-bold text-indigo-600 mb-4">${selectedProduct.price}</p>
            <button
              onClick={() => setSelectedProduct(null)}
              className="bg-gray-200 text-gray-800 px-4 py-2 rounded-md hover:bg-gray-300"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Products;