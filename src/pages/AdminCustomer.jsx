import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaUsers } from 'react-icons/fa';
import aksen from '../assets/images/aksen.png';
import AdminSidebar from './AdminSidebar';
import axios from 'axios';

const AdminCustomer = () => {
  const navigate = useNavigate();
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

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
            {error && <span className="text-red-500 text-xs">{error}</span>}
          </div>
          <div className="overflow-x-auto">
            {loading ? (
              <div className="flex justify-center items-center h-32">
                <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-red-800"></div>
              </div>
            ) : (
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
                  {customers.length === 0 ? (
                    <tr>
                      <td colSpan="5" className="text-center py-4">
                        Tidak ada pembeli ditemukan.
                      </td>
                    </tr>
                  ) : (
                    customers.map((customer, idx) => (
                      <tr
                        key={idx}
                        className="border-b border-gray-200 text-center hover:bg-gray-50 transition-colors"
                      >
                        <td className="py-2 px-3 text-xs">{idx + 1}</td>
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
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminCustomer;
