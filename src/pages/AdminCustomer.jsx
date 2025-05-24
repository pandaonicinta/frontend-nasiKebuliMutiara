import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaUsers, FaChevronLeft, FaChevronRight } from 'react-icons/fa';
import aksen from '../assets/images/aksen.png';
import AdminSidebar from './AdminSidebar';
import axios from 'axios';

const AdminCustomer = () => {
  const navigate = useNavigate();
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [customersPerPage] = useState(10);

  useEffect(() => {
    const userRole = localStorage.getItem('userRole');
    if (!userRole || userRole !== 'admin') {
      navigate('/');
    } else {
      fetchCustomers();
    }
  }, [navigate]);

  const fetchCustomers = async () => {
    try {
      setLoading(true);
      setError(null);
      const token = localStorage.getItem('token');
      const headers = { Authorization: `Bearer ${token}` };

      const response = await axios.get('http://kebabmutiara.xyz/api/dashboard/customer', { headers });

      let fetchedCustomers = response.data;

      setCustomers(fetchedCustomers);
      setLoading(false);
    } catch (err) {
      console.error('Error fetching customers:', err);
      setError('Failed to load customers. Please try again later.');
      setLoading(false);
    }
  };

  // Pagination calculations
  const totalPages = Math.ceil(customers.length / customersPerPage);
  const indexOfLastCustomer = currentPage * customersPerPage;
  const indexOfFirstCustomer = indexOfLastCustomer - customersPerPage;
  const currentCustomers = customers.slice(indexOfFirstCustomer, indexOfLastCustomer);

  const handlePageChange = (pageNumber) => {
    setCurrentPage(pageNumber);
  };

  const handlePrevPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
    }
  };

  const handleNextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage(currentPage + 1);
    }
  };

  return (
    <div className="flex min-h-screen bg-gray-100">
      <div
        className="absolute top-0 left-0 right-0 h-1/3 bg-red-800 z-0"
        style={{
          backgroundImage: `url(${aksen})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
        }}
      ></div>

      <AdminSidebar activePage="customers" />

      <div className="relative z-10 flex-1 ml-52 p-6">
        <div className="flex justify-between items-center mb-6 bg-white p-4 rounded-lg shadow-lg">
          <h1 className="text-xl font-bold text-red-800">Pembeli</h1>
          <div className="flex items-center bg-red-800 text-white px-4 py-2 rounded-lg">
            <FaUsers className="mr-2 text-sm" />
            <span className="text-sm font-medium">Admin</span>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-lg">
          <div className="flex justify-between items-center p-4 border-b border-gray-200">
            <h3 className="font-bold text-gray-800">Daftar Pembeli</h3>
            <div>
              {error && <span className="text-red-500 text-xs mr-4">{error}</span>}
              <button
                onClick={fetchCustomers}
                className="bg-red-800 text-white px-3 py-1 rounded text-xs font-bold hover:bg-red-900 transition"
              >
                REFRESH
              </button>
            </div>
          </div>
          
          {loading ? (
            <div className="flex justify-center items-center h-64">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-red-800"></div>
            </div>
          ) : error ? (
            <div className="text-center py-8 text-red-600">
              <p>{error}</p>
            </div>
          ) : (
            <>
              <div className="overflow-x-auto">
                <table className="min-w-full">
                  <thead>
                    <tr className="bg-red-800 text-white text-center">
                      <th className="py-2 px-3 text-xs">NO</th>
                      <th className="py-2 px-3 text-xs">NAMA</th>
                      <th className="py-2 px-3 text-xs">ALAMAT</th>
                      <th className="py-2 px-3 text-xs">TOTAL PEMBELIAN</th>
                      <th className="py-2 px-3 text-xs">TERAKHIR PEMBELIAN</th>
                    </tr>
                  </thead>
                  <tbody>
                    {currentCustomers.length === 0 ? (
                      <tr>
                        <td colSpan="5" className="text-center py-4 text-gray-500">
                          Tidak ada pembeli ditemukan.
                        </td>
                      </tr>
                    ) : (
                      currentCustomers.map((customer, idx) => (
                        <tr
                          key={idx}
                          className="border-b border-gray-200 text-center hover:bg-gray-50 transition-colors"
                        >
                          <td className="py-2 px-3 text-xs">{indexOfFirstCustomer + idx + 1}</td>
                          <td className="py-2 px-3 text-xs text-red-800">{customer.Nama}</td>
                          <td className="py-2 px-3 text-xs text-left text-red-800">{customer.Alamat}</td>
                          <td className="py-2 px-3 text-xs text-red-800">
                            {new Intl.NumberFormat('id-ID', {
                              style: 'currency',
                              currency: 'IDR',
                              minimumFractionDigits: 0,
                            }).format(customer.total_spent)}
                          </td>
                          <td className="py-2 px-3 text-xs text-red-800">
                            {new Intl.NumberFormat('id-ID', {
                              style: 'currency',
                              currency: 'IDR',
                              minimumFractionDigits: 0,
                            }).format(Number(customer.last_spent))}
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>

              {/* Pagination */}
              {customers.length > 0 && (
                <div className="flex justify-between items-center p-4 border-t border-gray-200">
                  <div className="text-sm text-gray-600">
                    Menampilkan {indexOfFirstCustomer + 1} - {Math.min(indexOfLastCustomer, customers.length)} dari {customers.length} pembeli
                  </div>
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={handlePrevPage}
                      disabled={currentPage === 1}
                      className={`p-2 rounded-md ${
                        currentPage === 1
                          ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                          : 'bg-red-800 text-white hover:bg-red-900'
                      } transition`}
                    >
                      <FaChevronLeft className="text-xs" />
                    </button>
                    
                    <span className="px-3 py-1 bg-red-800 text-white rounded-md text-sm">
                      {currentPage} / {totalPages}
                    </span>
                    
                    <button
                      onClick={handleNextPage}
                      disabled={currentPage === totalPages}
                      className={`p-2 rounded-md ${
                        currentPage === totalPages
                          ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                          : 'bg-red-800 text-white hover:bg-red-900'
                      } transition`}
                    >
                      <FaChevronRight className="text-xs" />
                    </button>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminCustomer;