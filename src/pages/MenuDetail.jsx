import React, { useState, useEffect, useContext } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { FiShoppingBag } from 'react-icons/fi';
import { HiOutlineArrowNarrowRight } from 'react-icons/hi';
import { FaStar } from 'react-icons/fa';
import { CartContext } from '../contexts/CartContext';
import logo from '../assets/images/logo.png';
import foto from '../assets/images/foto.png';

// Dummy data for menu items
const dummyMenuItems = [
  {
    id: 1,
    name: "Nasi Kebuli Ayam",
    description: "Nasi kebuli dengan topping ayam yang lezat dan bumbu rempah pilihan.",
    price: "Rp. 20.000",
    rating: "4.9/5",
    image: foto,
    longDescription: "Ratione voluptatem sequi nesciunt neque porro quisquam est, qui dolorem ipsum quia dolor sit amet, consectetur, adipisci velit, sed quia non numquam eius modi tempora incidunt ut labore et dolore magnam aliquam quaerat voluptatem. Ut enim ad minima veniam quis nostrum exercitationem ullam corporis suscipit laboriosam, nisi ut aliquid ex ea commodi consequatur.",
    additionalInfo: {
      weight: "500g",
      dimensions: "20 × 30 × 5 cm",
      ingredients: "Rice, chicken, spices, vegetables",
      allergens: "May contain traces of nuts"
    }
  },
  {
    id: 2,
    name: "Nasi Kebuli Sapi",
    description: "Nasi kebuli dengan topping daging sapi premium yang lezat dan bumbu rempah pilihan.",
    price: "Rp. 35.000",
    rating: "4.8/5",
    image: foto,
    longDescription: "Nasi kebuli daging sapi dimasak dengan rempah pilihan dan rasa yang khas dari timur tengah. Daging sapi premium yang empuk dan juicy memberikan pengalaman makan yang luar biasa.",
    additionalInfo: {
      weight: "520g",
      dimensions: "20 × 30 × 5 cm",
      ingredients: "Rice, beef, spices, vegetables",
      allergens: "May contain traces of nuts"
    }
  },
  {
    id: 3,
    name: "Nasi Kebuli Kambing",
    description: "Nasi kebuli dengan topping daging kambing yang dimasak sempurna.",
    price: "Rp. 55.000",
    rating: "4.9/5",
    image: foto,
    longDescription: "Ratione voluptatem sequi nesciunt neque porro quisquam est, qui dolorem ipsum quia dolor sit amet, consectetur, adipisci velit, sed quia non numquam eius modi tempora incidunt ut labore et dolore magnam aliquam quaerat voluptatem.",
    additionalInfo: {
      weight: "550g",
      dimensions: "20 × 30 × 5 cm",
      ingredients: "Rice, mutton, spices, vegetables",
      allergens: "May contain traces of nuts"
    }
  },
  {
    id: 4,
    name: "Nasi Kebuli Spesial",
    description: "Nasi kebuli dengan topping daging campur ayam dan sapi serta telur.",
    price: "Rp. 45.000",
    rating: "4.7/5",
    image: foto,
    longDescription: "Kombinasi sempurna dari daging ayam dan sapi yang dimasak dengan bumbu kebuli khas Mutiara. Disajikan dengan telur rebus dan acar segar.",
    additionalInfo: {
      weight: "600g",
      dimensions: "20 × 30 × 5 cm",
      ingredients: "Rice, chicken, beef, egg, spices, vegetables",
      allergens: "May contain traces of nuts and eggs"
    }
  }
];

// Dummy review data
const dummyReviews = [
  {
    id: 1,
    name: "Ahmad Fauzi",
    date: "10 Maret 2025",
    rating: 5,
    comment: "Nasi kebuli terbaik yang pernah saya makan! Bumbu yang meresap dan daging yang empuk, sangat memuaskan."
  },
  {
    id: 2,
    name: "Siti Aminah",
    date: "5 Maret 2025",
    rating: 4,
    comment: "Rasanya autentik dan porsinya cukup banyak. Saya suka dengan aroma rempahnya yang khas."
  },
  {
    id: 3,
    name: "Budi Santoso",
    date: "28 Februari 2025",
    rating: 5,
    comment: "Sudah langganan di sini selama bertahun-tahun. Kualitas selalu konsisten dan pelayanannya ramah."
  }
];

const MenuDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [quantity, setQuantity] = useState(1);
  const [selectedSize, setSelectedSize] = useState('L');
  const [activeTab, setActiveTab] = useState('Description');
  const [mainImage, setMainImage] = useState(null);
  const [thumbnailIndex, setThumbnailIndex] = useState(0);
  const [addedToCart, setAddedToCart] = useState(false);
  
  // Use the CartContext
  const { addToCart, cartCount } = useContext(CartContext);
  
  // Create dummy thumbnail images array
  const thumbnails = [foto, foto, foto, foto];
  
  // Find the menu item with the matching id
  const menuId = parseInt(id);
  const menu = dummyMenuItems.find(item => item.id === menuId);
  
  // Set initial main image when menu is loaded
  useEffect(() => {
    if (menu) {
      setMainImage(menu.image);
    }
  }, [menu]);
  
  // Redirect to menu page if menu item not found
  useEffect(() => {
    if (!menu) {
      navigate('/menu');
    }
  }, [menu, navigate]);

  // If menu is not found and hasn't redirected yet, show loading
  if (!menu) {
    return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
  }

  // Generate related menus (excluding current menu)
  const relatedMenus = dummyMenuItems
    .filter(item => item.id !== menuId)
    .slice(0, 3);

  const increment = () => setQuantity(prev => prev + 1);
  const decrement = () => setQuantity(prev => prev > 1 ? prev - 1 : 1);
  
  // Handle thumbnail navigation
  const showNextThumbnails = () => {
    if (thumbnailIndex + 4 < thumbnails.length) {
      setThumbnailIndex(thumbnailIndex + 1);
    }
  };
  
  const showPrevThumbnails = () => {
    if (thumbnailIndex > 0) {
      setThumbnailIndex(thumbnailIndex - 1);
    }
  };
  
  // Handle add to cart
  const handleAddToCart = () => {
    const cartItem = {
      id: menu.id,
      name: menu.name,
      price: menu.price,
      image: menu.image,
      quantity: quantity,
      size: selectedSize
    };
    
    addToCart(cartItem);
    
    // Show success message
    setAddedToCart(true);
    setTimeout(() => setAddedToCart(false), 3000);
  };
  
  // Handle thumbnail click
  const handleThumbnailClick = (thumb) => {
    setMainImage(thumb);
  };
  
  // Visible thumbnails based on current index
  const visibleThumbnails = thumbnails.slice(thumbnailIndex, thumbnailIndex + 4);

  return (
    <div className="min-h-screen bg-white">
      {/* Modified Navigation Bar with white background and full-width shadow */}
      <header className="bg-white py-4 px-6 md:px-16 lg:px-24 w-full">
        <div className="flex justify-between items-center">
          <div>
            <img 
              src={logo} 
              alt="Nasi Kebuli Mutiara" 
              className="h-12 cursor-pointer" 
              onClick={() => navigate('/')}
            />
          </div>
          <div className="flex items-center space-x-8">
            <a href="/" className="text-gray-800 hover:text-[#FDC302] font-medium">Home</a>
            <a href="/about" className="text-gray-800 hover:text-[#FDC302] font-medium">About Us</a>
            <a href="/menu" className="text-[#FDC302] font-medium">Menu</a>
            <a href="/cart" className="text-gray-800 hover:text-[#FDC302] relative">
              <FiShoppingBag size={20} />
              <span className="absolute -top-1 -right-1 bg-[#FDC302] text-white rounded-full w-4 h-4 flex items-center justify-center text-xs">
                {cartCount}
              </span>
            </a>
            <a href="/login" className="px-6 py-2 bg-gradient-to-r from-[#FDC302] to-yellow-300 text-white rounded-full hover:from-yellow-500 hover:to-yellow-400 shadow-md transition duration-300 flex items-center">
              Login <HiOutlineArrowNarrowRight className="ml-2" />
            </a>
          </div>
        </div>
      </header>

      {/* Breadcrumb */}
      <div className="container mx-auto px-6 md:px-16 lg:px-24 py-4 bg-white">
        <div className="flex items-center text-sm">
          <a href="/menu" className="text-gray-500 hover:text-[#FDC302]">Menu</a>
          <span className="mx-2">›</span>
          <span className="text-gray-700">{menu.name}</span>
        </div>
      </div>

      {/* Menu Detail Section */}
      <div className="container mx-auto px-6 md:px-16 lg:px-24 py-8 bg-white">
        <div className="flex flex-col gap-8">
          {/* Menu Images and Info - Top Section */}
          <div className="flex flex-col lg:flex-row gap-8">
            {/* Menu Images */}
            <div className="lg:w-1/2">
              <div className="bg-gray-100 rounded-lg mb-4 h-96 flex items-center justify-center">
                <img src={mainImage} alt={menu.name} className="w-full h-auto object-contain max-h-full" />
              </div>
              <div className="relative">
                <button 
                  onClick={showPrevThumbnails}
                  className="absolute left-0 top-1/2 -translate-y-1/2 z-10 bg-white rounded-full p-2 shadow-md hover:bg-gray-100 transition"
                  disabled={thumbnailIndex === 0}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-700" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                  </svg>
                </button>
                <div className="grid grid-cols-4 gap-2 mx-8">
                  {visibleThumbnails.map((thumb, i) => (
                    <div 
                      key={i + thumbnailIndex} 
                      className={`border rounded-lg overflow-hidden cursor-pointer hover:border-[#FDC302] transition ${
                        mainImage === thumb ? 'border-[#FDC302]' : 'border-gray-200'
                      }`}
                      onClick={() => handleThumbnailClick(thumb)}
                    >
                      <img src={thumb} alt={`${menu.name} thumbnail ${i + thumbnailIndex + 1}`} className="w-full h-auto" />
                    </div>
                  ))}
                </div>
                <button 
                  onClick={showNextThumbnails}
                  className="absolute right-0 top-1/2 -translate-y-1/2 z-10 bg-white rounded-full p-2 shadow-md hover:bg-gray-100 transition"
                  disabled={thumbnailIndex + 4 >= thumbnails.length}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-700" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </button>
              </div>
            </div>

            {/* Menu Info */}
            <div className="lg:w-1/2">
              <h1 className="text-3xl font-bold text-gray-900 mb-2">{menu.name}</h1>
              <div className="flex items-center mb-4">
                {[1, 2, 3, 4, 5].map(star => (
                  <FaStar key={star} className="text-[#FDC302]" />
                ))}
                <span className="ml-2 text-sm text-gray-500">({menu.rating})</span>
              </div>
              <h2 className="text-2xl font-bold text-[#B22222] mb-6">{menu.price}</h2>
              <p className="text-gray-700 mb-6">{menu.description}</p>

              {/* Size Selection */}
              <div className="mb-6">
                <h3 className="font-medium mb-2">Ukuran:</h3>
                <div className="flex space-x-4">
                  {['S', 'M', 'L'].map(size => (
                    <button 
                      key={size}
                      onClick={() => setSelectedSize(size)}
                      className={`w-10 h-10 rounded-full flex items-center justify-center border ${
                        selectedSize === size ? 'border-[#FDC302] bg-[#FDC302] text-white' : 'border-gray-300 text-gray-700'
                      }`}
                    >
                      {size}
                    </button>
                  ))}
                </div>
              </div>

              {/* Quantity & Add to Cart */}
              <div className="flex items-center space-x-4 mb-6">
                <div className="flex items-center border border-gray-300 rounded-md">
                  <button 
                    onClick={decrement}
                    className="px-4 py-2 text-gray-600 hover:bg-gray-100"
                    aria-label="Decrease quantity"
                  >
                    -
                  </button>
                  <span className="px-4 py-2">{quantity}</span>
                  <button 
                    onClick={increment}
                    className="px-4 py-2 text-gray-600 hover:bg-gray-100"
                    aria-label="Increase quantity"
                  >
                    +
                  </button>
                </div>
                <button 
                  onClick={handleAddToCart}
                  className="bg-[#B22222] text-white py-2 px-6 rounded-md hover:bg-red-700 transition duration-300 flex items-center"
                >
                  Add to Cart <HiOutlineArrowNarrowRight className="ml-2" />
                </button>
              </div>
              
              {/* Cart Success Message */}
              {addedToCart && (
                <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded relative mb-6" role="alert">
                  <strong className="font-bold">Success! </strong>
                  <span className="block sm:inline">{menu.name} ({selectedSize}) has been added to your cart.</span>
                </div>
              )}
            </div>
          </div>

          {/* Separator Line */}
          <div className="border-t border-gray-200 container mx-auto px-6 md:px-16 lg:px-24 bg-white"></div>


          {/* Additional Information - Bottom Section - Updated Tab Design */}
          <div className="tabs-container w-full">
            <div className="flex justify-center border-b">
              {['Description', 'Additional Information', 'Reviews'].map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab === 'Additional Information' ? 'Additional Info' : tab)}
                  className={`px-6 py-3 font-bold ${
                    activeTab === (tab === 'Additional Information' ? 'Additional Info' : tab)
                      ? 'text-[#FDC302] border-b-2 border-[#FDC302]'
                      : 'text-gray-500'
                  }`}
                >
                  {tab}
                </button>
              ))}
            </div>
            
            <div className="py-6 max-w-3xl mx-auto">
              {activeTab === 'Description' && (
                <div className="text-center">
                  <p className="text-gray-700 font-medium">{menu.longDescription}</p>
                  <p className="text-gray-700 mt-4 font-medium">Quia voluptas sit aspernatur aut odit aut fugit, sed quia consequuntur magni dolores eos qui ratione voluptatem sequi nesciunt porro quisquam est, qui dolore ipsum quia dolor sit amet, consectetur, adipisci velit, sed quia non numquam eius modi tempora incidunt ut labore et dolore magnam aliquam quaerat voluptate ruis aute irure dolor in reprehenderit.</p>
                </div>
              )}
              
              {activeTab === 'Additional Info' && (
                <div className="mx-auto">
                  <table className="w-full">
                    <tbody>
                      {Object.entries(menu.additionalInfo).map(([key, value]) => (
                        <tr key={key} className="border-b">
                          <td className="py-2 font-bold text-gray-500 capitalize w-1/3">{key}</td>
                          <td className="py-2 text-gray-700 font-medium">{value}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
              
              {activeTab === 'Reviews' && (
                <div>
                  {dummyReviews.map(review => (
                    <div key={review.id} className="border-b pb-4 mb-4">
                      <div className="flex justify-between mb-2">
                        <span className="font-bold">{review.name}</span>
                        <span className="text-gray-500 text-sm">{review.date}</span>
                      </div>
                      <div className="flex mb-2">
                        {[1, 2, 3, 4, 5].map(star => (
                          <FaStar 
                            key={star} 
                            className={star <= review.rating ? "text-[#FDC302]" : "text-gray-300"} 
                          />
                        ))}
                      </div>
                      <p className="text-gray-700 font-medium">{review.comment}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Separator Line */}
      <div className="border-t border-gray-200 container mx-auto px-6 md:px-16 lg:px-24 bg-white"></div>

      {/* Related Products - Now with white background */}
      <div className="bg-white py-12 px-6 md:px-16 lg:px-32">
        <div className="container mx-auto">
          <h2 className="text-3xl font-berkshire mb-8 text-center">
            <span className="text-black">Related </span>
            <span className="text-[#FDC302]">Products</span>
          </h2>
          <p className="text-center text-gray-600 mb-8 font-medium">Choose from some of related products</p>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {relatedMenus.map(item => (
              <div
                key={item.id}
                className="bg-white rounded-lg shadow-md overflow-hidden border border-gray-200 hover:border-[#FDC302] transition-all duration-300 cursor-pointer"
                onClick={() => navigate(`/menu/${item.id}`)}
              >
                <div className="relative pt-[66%] overflow-hidden">
                  <img
                    src={item.image}
                    alt={item.name}
                    className="absolute inset-0 w-full h-full object-cover"
                  />
                </div>
                <div className="p-4">
                  <h3 className="text-xl font-bold text-gray-900 mb-2">{item.name}</h3>
                  <p className="text-gray-700 mb-4 line-clamp-2">{item.description}</p>
                  <div className="flex items-center justify-between w-full mb-4">
                    <div className="flex items-center text-[#FDC302]">
                      <FaStar className="mr-1" />
                      <span>{item.rating}</span>
                    </div>
                    <span className="text-lg font-semibold text-[#B22222]">{item.price}</span>
                  </div>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      navigate(`/menu/${item.id}`);
                    }}
                    className="w-full bg-[#FDC302] text-white py-2 px-4 rounded-md hover:bg-yellow-500 transition duration-300"
                  >
                    Buy Now
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
      
      {/* Footer*/}
      <footer className="bg-red-900 text-white py-8 px-6 md:px-20 lg:px-32">
      <div className="container mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="lg:col-span-1">
            <img src={logo} alt="Kebuli Mutiara" className="h-14 mb-2" />
          </div>
          <div className="lg:col-span-1">
            <h3 className="text-base font-semibold mb-4">Navigation</h3>
            <div className="grid grid-cols-2 gap-x-4">
              <ul className="space-y-2">
                <li>
                  <a href="#" className="hover:text-yellow-400 flex items-center text-xs">
                    <span className="text-yellow-400 mr-2">•</span>
                    Home
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-yellow-400 flex items-center text-xs">
                    <span className="text-yellow-400 mr-2">•</span>
                    About
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-yellow-400 flex items-center text-xs">
                    <span className="text-yellow-400 mr-2">•</span>
                    Shop
                  </a>
                </li>
              </ul>
              <ul className="space-y-2">
                <li>
                  <a href="#" className="hover:text-yellow-400 flex items-center text-xs">
                    <span className="text-yellow-400 mr-2">•</span>
                    Products
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-yellow-400 flex items-center text-xs">
                    <span className="text-yellow-400 mr-2">•</span>
                    Blog
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-yellow-400 flex items-center text-xs">
                    <span className="text-yellow-400 mr-2">•</span>
                    Contact
                  </a>
                </li>
              </ul>
            </div>
          </div>

          {/* Address */}
          <div className="lg:col-span-1">
            <div className="flex items-start mb-3">
              <div className="bg-red-800 p-1.5 rounded-full mr-2 mt-1">
                <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                  <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
                </svg>
              </div>
              <div>
                <h4 className="font-semibold text-xs">Address:</h4>
                <p className="text-xs">
                  Jl. Villa Mutiara Cikarang blok H10, No.37, Ciantra, Cikarang Sel. Kab. Bekasi, Jawa Barat 17530
                </p>
              </div>
            </div>

            <div className="flex items-start">
              <div className="bg-red-800 p-1.5 rounded-full mr-2 mt-1">
                <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                  <path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z" />
                  <path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z" />
                </svg>
              </div>
              <div>
                <h4 className="font-semibold text-xs">Email:</h4>
                <p className="text-xs">mutiara@gmail.com</p>
              </div>
            </div>
          </div>

          {/* Phone */}
          <div className="lg:col-span-1">
            <div className="flex items-center mb-4">
              <div className="bg-red-800 p-1.5 rounded-full mr-2">
                <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                  <path d="M2 3a1 1 0 011-1h2.153a1 1 0 01.986.836l.74 4.435a1 1 0 01-.54 1.06l-1.548.773a11.037 11.037 0 006.105 6.105l.774-1.548a1 1 0 011.059-.54l4.435.74a1 1 0 01.836.986V17a1 1 0 01-1 1h-2C7.82 18 2 12.18 2 5V3z" />
                </svg>
              </div>
              <div>
                <h4 className="text-sm font-bold">+62 897-9792-939</h4>
                <p className="text-xs">Got Questions? Call us 24/7</p>
              </div>
            </div>

            {/*Social Media */}
            <div className="flex justify-end space-x-3 mt-4">
              <a href="#" className="bg-red-800 p-1.5 rounded-md hover:bg-red-700">
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path d="M22 12c0-5.523-4.477-10-10-10S2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.878v-6.987h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33v6.988C18.343 21.128 22 16.991 22 12z" />
                </svg>
              </a>
              <a href="#" className="bg-red-800 p-1.5 rounded-md hover:bg-red-700">
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.644.069 3.204 2.163 7.298 2.163 4.095 0 4.559-.012 4.85-.07 4.915-.188 6.445-1.718 6.633-6.632.058-1.29.07-1.752.07-4.85 0-3.098-.013-3.559-.07-4.849-.188-4.92-1.724-6.454-6.633-6.632-1.29-.058-1.752-.07-4.85-.07zm0 2.16c3.203 0 3.585.016 4.85.071 2.802.128 4.049 1.393 4.176 4.175.055 1.265.07 1.644.07 4.849 0 3.205-.015 3.586-.07 4.85-.127 2.783-1.374 4.048-4.176 4.176-1.265.055-1.647.07-4.85.07-3.201 0-3.584-.015-4.848-.07-2.802-.128-4.049-1.393-4.176-4.176-.055-1.264-.07-1.645-.07-4.85 0-3.205.015-3.584.07-4.849.127-2.783 1.374-4.048 4.176-4.175 1.264-.055 1.646-.07 4.848-.07zm0 3.676a5.16 5.16 0 100 10.32 5.16 5.16 0 000-10.32zm0 8.486a3.326 3.326 0 110-6.652 3.326 3.326 0 010 6.652zm6.532-8.694a1.206 1.206 0 11-2.413 0 1.206 1.206 0 012.413 0z" />
                </svg>
              </a>
            </div>
          </div>
        </div>
      </div>
    </footer>

    {/* Copyright Section */}
    <div className="bg-red-900 text-white text-center py-3 px-6 md:px-20 lg:px-32">
    <div className="w-full h-px bg-red-800 mb-4"></div> 
      <div className="p-0 mt-0"></div>
      <div className="container mx-auto">
        <p className="text-xs">Copyright © 2025 Kebuli Mutiara. All rights reserved.</p>
      </div>
    </div>
    </div>
  );
};

export default MenuDetail;