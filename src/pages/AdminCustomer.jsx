import React from 'react';
import { FaUsers } from 'react-icons/fa';
import aksen from '../assets/images/aksen.png';
import AdminSidebar from './AdminSidebar';

const AdminCustomer = () => {
  const customers = [
    { no: 1, name: 'Pandaoni', address: 'Jalan Sunter, Babakan, Bogor Tengah, Kota Bogor, Jawa Barat', totalSpent: 'Rp. 55.000', lastSpent: 'Rp. 55.000' },
    { no: 2, name: 'Ario Elnino', address: 'Jalan Padjajaran, Babakan, Bogor Tengah, Kota Bogor, Jawa Barat', totalSpent: 'Rp. 350.000', lastSpent: 'Rp. 350.000' },

  ];

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

      {/* Sidebar Component */}
      <AdminSidebar activePage="customers" />

      {/* Main Content */}
      <div className="relative z-10 flex-1 ml-52 p-6">
        <div className="flex justify-between items-center mb-6 bg-white p-4 rounded-lg shadow-lg">
          <h1 className="text-xl font-bold text-red-800">Customer</h1>
          <div className="flex items-center bg-red-800 text-white px-4 py-2 rounded-lg">
            <FaUsers className="mr-2 text-sm" />
            <span className="text-sm font-medium">Admin</span>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-lg">
          <div className="flex justify-between items-center p-4 border-b border-gray-200">
            <h3 className="font-bold text-gray-800">Customer</h3>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full">
              <thead>
                <tr className="bg-red-800 text-white text-center">
                  <th className="py-2 px-3 text-xs">NO</th>
                  <th className="py-2 px-3 text-xs">NAME</th>
                  <th className="py-2 px-3 text-xs">ADDRESS</th>
                  <th className="py-2 px-3 text-xs">TOTAL SPENT</th>
                  <th className="py-2 px-3 text-xs">LAST SPENT</th>
                </tr>
              </thead>
              <tbody>
                {customers.map((customer) => (
                  <tr
                    key={customer.no}
                    className="border-b border-gray-200 text-center hover:bg-gray-50 transition-colors"
                  >
                    <td className="py-2 px-3 text-xs">{customer.no}</td>
                    <td className="py-2 px-3 text-xs text-red-800">{customer.name}</td>
                    <td className="py-2 px-3 text-xs text-left text-red-800">{customer.address}</td>
                    <td className="py-2 px-3 text-xs text-red-800">{customer.totalSpent}</td>
                    <td className="py-2 px-3 text-xs text-red-800">{customer.lastSpent}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminCustomer;