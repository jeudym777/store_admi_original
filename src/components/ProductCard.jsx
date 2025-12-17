// src/components/ProductCard.jsx
import React from "react";

const ProductCard = ({ product }) => {
  return (
    <div className="group border-2 border-gray-100 rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 p-5 bg-white/90 backdrop-blur-sm flex flex-col hover:-translate-y-2 hover:border-sky-200">
      {/* Imagen del producto */}
      <div className="w-full h-48 overflow-hidden rounded-xl bg-gradient-to-br from-gray-50 to-gray-100 mb-4 relative">
        <img
          src={product.image_urls?.[0] || "/placeholder.jpg"}
          alt={product.name_product}
          className="object-cover w-full h-full group-hover:scale-110 transition-transform duration-500"
          loading="lazy"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
      </div>

      {/* Nombre y descripción */}
      <h2 className="font-bold text-xl text-gray-800 truncate mb-2 group-hover:text-sky-700 transition-colors">
        {product.name_product}
      </h2>
      <p className="text-gray-600 text-sm line-clamp-2 mb-3 leading-relaxed">
        {product.description}
      </p>

      {/* Precio */}
      <div className="mt-auto">
        <div className="font-bold text-2xl bg-gradient-to-r from-sky-600 to-indigo-700 bg-clip-text text-transparent">
          ₡{product.price.toLocaleString("es-CR")}
        </div>

        {/* Galería miniatura (opcional) */}
        {product.image_urls?.length > 1 && (
          <div className="flex gap-2 mt-4">
            {product.image_urls.map((url, i) => (
              <img
                key={i}
                src={url}
                className="w-12 h-12 rounded-lg border-2 border-gray-200 object-cover hover:border-sky-400 transition-colors cursor-pointer"
                alt={`Extra ${i + 1}`}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default ProductCard;
