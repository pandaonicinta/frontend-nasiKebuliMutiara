import React from 'react';
import { FaUsers } from 'react-icons/fa';
import aksen from '../assets/images/aksen.png';
import AdminSidebar from './AdminSidebar';

const AdminCustomer = () => {
  // Customer data with fixed values based on the screenshot
  const customers = [
    { no: 1, name: 'Agus', address: 'Jln. Raya XXXXX XXXXXXXX XXXXX', totalSpent: 'Rp. 900.000', lastSpent: 'Rp. 50.000' },
    { no: 2, name: 'Agus', address: 'Jln. Raya XXXXX XXXXXXXX XXXXX', totalSpent: 'Rp. 900.000', lastSpent: 'Rp. 50.000' },
    { no: 3, name: 'Agus', address: 'Jln. Raya XXXXX XXXXXXXX XXXXX', totalSpent: 'Rp. 900.000', lastSpent: 'Rp. 50.000' },
    { no: 4, name: 'Agus', address: 'Jln. Raya XXXXX XXXXXXXX XXXXX', totalSpent: 'Rp. 900.000', lastSpent: 'Rp. 50.000' },
    { no: 5, name: 'Agus', address: 'Jln. Raya XXXXX XXXXXXXX XXXXX', totalSpent: 'Rp. 900.000', lastSpent: 'Rp. 50.000' },
    { no: 6, name: 'Agus', address: 'Jln. Raya XXXXX XXXXXXXX XXXXX', totalSpent: 'Rp. 900.000', lastSpent: 'Rp. 50.000' },
    { no: 7, name: 'Agus', address: 'Jln. Raya XXXXX XXXXXXXX XXXXX', totalSpent: 'Rp. 900.000', lastSpent: 'Rp. 50.000' },
    { no: 8, name: 'Agus', address: 'Jln. Raya XXXXX XXXXXXXX XXXXX', totalSpent: 'Rp. 900.000', lastSpent: 'Rp. 50.000' },
    { no: 9, name: 'Agus', address: 'Jln. Raya XXXXX XXXXXXXX XXXXX', totalSpent: 'Rp. 900.000', lastSpent: 'Rp. 50.000' },
    { no: 10, name: 'Agus', address: 'Jln. Raya XXXXX XXXXXXXX XXXXX', totalSpent: 'Rp. 900.000', lastSpent: 'Rp. 50.000' },
    { no: 11, name: 'Agus', address: 'Jln. Raya XXXXX XXXXXXXX XXXXX', totalSpent: 'Rp. 900.000', lastSpent: 'Rp. 50.000' },
    { no: 12, name: 'Agus', address: 'Jln. Raya XXXXX XXXXXXXX XXXXX', totalSpent: 'Rp. 900.000', lastSpent: 'Rp. 50.000' },
    { no: 13, name: 'Agus', address: 'Jln. Raya XXXXX XXXXXXXX XXXXX', totalSpent: 'Rp. 900.000', lastSpent: 'Rp. 50.000' },
    { no: 14, name: 'Agus', address: 'Jln. Raya XXXXX XXXXXXXX XXXXX', totalSpent: 'Rp. 900.000', lastSpent: 'Rp. 50.000' }
  ];

  return (
    <div className="flex min-h-screen bg-gray-100">
      {/* Background with red top 1/3 and accent pattern */}
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
        {/* Header with Customer and Admin in a box */}
        <div className="flex justify-between items-center mb-6 bg-white p-4 rounded-lg shadow-lg">
          <h1 className="text-xl font-bold text-red-800">Customer</h1>
          <div className="flex items-center bg-red-800 text-white px-4 py-2 rounded-lg">
            <FaUsers className="mr-2 text-sm" />
            <span className="text-sm font-medium">Admin</span>
          </div>
        </div>

        {/* Customer Table - Styled with box and shadow */}
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