import React, { useState, useEffect } from 'react';
import { FaUsers, FaPencilAlt, FaTrash, FaPlus, FaSpinner, FaExclamationTriangle } from 'react-icons/fa';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import aksen from '../assets/images/aksen.png';
import AdminSidebar from './AdminSidebar';

const AdminMenu = () => {
  const [menus, setMenus] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [deleteLoading, setDeleteLoading] = useState(null);
  const navigate = useNavigate();
  const API_URL = 'http://kebabmutiara.xyz';

  useEffect(() => {
    fetchMenus();
    const token = localStorage.getItem('token');
    if (!token) {
      navigate('/login');
    }
  }, [navigate]);

  const fetchMenus = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${API_URL}/api/produk`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      
      if (response.data && Array.isArray(response.data)) {
        setMenus(response.data);
      } else {
        console.error('Invalid response format:', response.data);
        setMenus([]);
        setError('Invalid data format received from the server.');
      }
    } catch (err) {
      console.error('Error fetching menu items:', err);
      setError('Failed to load menu items. Please try again later.');
      
      if (err.response && err.response.status === 401) {
        localStorage.removeItem('token');
        navigate('/login');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this menu item? This action cannot be undone.")) {
      try {
        setDeleteLoading(id);
        
        const response = await axios.delete(`${API_URL}/api/produk/delete/${id}`, {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          }
        });
        
        // Check response
        if (response.status === 200) {
          setMenus(prevMenus => prevMenus.filter(menu => menu.produk_id !== id));
          alert("Menu item has been deleted successfully.");
        } else {
          throw new Error(response.data?.message || 'Delete operation failed');
        }
      } catch (err) {
        console.error('Error deleting menu item:', err);
        
        if (err.response && err.response.status === 401) {
          localStorage.removeItem('token');
          navigate('/login');
          return;
        }
        
        alert(err.response?.data?.message || "Failed to delete menu item. Please try again.");
      } finally {
        setDeleteLoading(null);
      }
    }
  };

  const handleEdit = (id) => {
    // Navigate to the add/edit menu page with isEdit flag
    navigate('/admin/menu/add', { state: { isEdit: true, menuId: id } });
  };

  const formatCurrency = (price) => {
    if (!price) return 'Rp. 0';
    return `Rp. ${parseInt(price).toLocaleString('id-ID')}`;
  };

  const getImageUrl = (imagePath) => {
    if (!imagePath) return 'https://via.placeholder.com/80?text=No+Image';
    if (imagePath.startsWith('http')) {
      return imagePath;
    }
    return `${API_URL}/storage/${imagePath}`;
  };

  return (
    <div className="flex min-h-screen bg-gray-100">
      <div
        className="absolute top-0 left-0 right-0 h-1/3 bg-red-800 z-0"
        style={{
          backgroundImage: `url(${aksen})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center'
        }}>
      </div>

      {/* Sidebar */}
      <AdminSidebar activePage="menu" />

      {/* Main Content */}
      <div className="relative z-10 flex-1 ml-52 p-6">
        {/* Header */}
        <div className="flex justify-between items-center mb-6 bg-white p-4 rounded-lg shadow-lg">
          <h1 className="text-xl font-bold text-red-800">Menu</h1>
          <div className="flex items-center bg-red-800 text-white px-4 py-2 rounded-lg">
            <FaUsers className="mr-2 text-sm" />
            <span className="text-sm font-medium">Admin</span>
          </div>
        </div>

        {/* Menu Section */}
        <div className="bg-white rounded-lg shadow-lg">
          <div className="flex justify-between items-center p-4 border-b border-gray-200">
            <h2 className="font-bold text-gray-800">Daftar Menu</h2>
            <Link to="/admin/menu/add" className="flex items-center bg-red-800 text-white px-3 py-1 rounded-lg text-sm">
              <FaPlus className="mr-1" />
              <span>Tambah Menu</span>
            </Link>
          </div>

          {loading ? (
            <div className="text-center py-8">
              <FaSpinner className="animate-spin inline-block text-red-800 text-2xl" />
              <p className="mt-2">Loading menu items...</p>
            </div>
          ) : error ? (
            <div className="text-center py-8 text-red-600">
              <FaExclamationTriangle className="inline-block text-2xl mb-2" />
              <p>{error}</p>
              <button 
                className="mt-4 bg-red-800 text-white px-4 py-2 rounded-lg"
                onClick={fetchMenus}
              >
                Try Again
              </button>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full">
                <thead>
                  <tr className="bg-red-800 text-white text-center">
                    <th className="py-2 px-3 text-xs">NO</th>
                    <th className="py-2 px-3 text-xs">NAMA</th>
                    <th className="py-2 px-3 text-xs">KATEGORI</th>
                    <th className="py-2 px-3 text-xs">DESKRIPSI</th>
                    <th className="py-2 px-3 text-xs">HARGA</th>
                    <th className="py-2 px-3 text-xs">STOK</th>
                    <th className="py-2 px-3 text-xs">FOTO</th>
                    <th className="py-2 px-3 text-xs">EDIT</th>
                  </tr>
                </thead>
                <tbody>
                  {menus.length === 0 ? (
                    <tr>
                      <td colSpan="9" className="text-center py-4">No menu items found</td>
                    </tr>
                  ) : (
                    menus.map((menu, index) => (
                      <tr
                        key={menu.produk_id}
                        className="border-b border-gray-200 text-center hover:bg-gray-50 transition-colors"
                      >
                        <td className="py-2 px-3 text-xs">{index + 1}</td>
                        <td className="py-2 px-3 text-xs text-red-800">{menu.nama_produk}</td>
                        <td className="py-2 px-3 text-xs text-red-800">{menu.kategori}</td>
                        <td className="py-2 px-3 text-xs text-left text-red-800">
                          {menu.deskripsi?.length > 50
                            ? `${menu.deskripsi.substring(0, 50)}...`
                            : menu.deskripsi || 'No description'}
                        </td>
                        <td className="py-2 px-3 text-xs text-red-800">{formatCurrency(menu.harga)}</td>
                        <td className="py-2 px-3 text-xs text-red-800">{menu.stok}</td>
                        <td className="py-2 px-3">
                          <div className="flex justify-center">
                            <div className="relative h-12 w-12 rounded-full overflow-hidden">
                              {menu.gambar ? (
                                <img
                                  src={getImageUrl(menu.gambar)}
                                  alt={menu.nama_produk}
                                  className="h-full w-full object-cover"
                                  onError={(e) => {
                                    e.target.onerror = null;
                                    console.log("Image failed to load:", e.target.src);
                                    
                                    const originalPath = e.target.src;
                                    const fileName = menu.gambar.split('/').pop();
                                    
                                    const fallback1 = `${API_URL}/storage/produk/${fileName}`;
                                    console.log("Trying fallback 1:", fallback1);
                                    
                                    if (originalPath !== fallback1) {
                                      e.target.src = fallback1;
                                      return;
                                    }

                                    const fallback2 = `${API_URL}/produk/${fileName}`;
                                    console.log("Trying fallback 2:", fallback2);
                                    
                                    if (originalPath !== fallback2) {
                                      e.target.src = fallback2;
                                      return;
                                    }

                                    e.target.src = 'https://via.placeholder.com/80?text=No+Image';
                                  }}
                                />
                              ) : (
                                <div className="h-full w-full bg-gray-200 flex items-center justify-center text-gray-500 text-xs">
                                  Tidak ada foto
                                </div>
                              )}
                            </div>
                          </div>
                        </td>
                        <td className="py-2 px-3">
                          <div className="flex justify-center space-x-2">
                            <button
                              className="text-blue-600 hover:text-blue-800"
                              onClick={() => handleEdit(menu.produk_id)}
                              disabled={loading}
                              title="Edit menu item"
                            >
                              {loading && deleteLoading === null ? (
                                <FaSpinner size={14} className="animate-spin" />
                              ) : (
                                <FaPencilAlt size={14} />
                              )}
                            </button>
                            <button
                              className="text-red-600 hover:text-red-800"
                              onClick={() => handleDelete(menu.produk_id)}
                              disabled={deleteLoading === menu.produk_id}
                              title="Delete menu item"
                            >
                              {deleteLoading === menu.produk_id ? (
                                <FaSpinner size={14} className="animate-spin" />
                              ) : (
                                <FaTrash size={14} />
                              )}
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminMenu;