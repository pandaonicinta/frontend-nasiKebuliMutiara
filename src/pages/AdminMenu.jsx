import React from 'react';
import { FaChartPie, FaUsers, FaShoppingCart, FaHome, FaSignOutAlt, FaInfo, FaUtensils, FaPencilAlt, FaTrash, FaPlus } from 'react-icons/fa';
import { Link } from 'react-router-dom';
import logo from '../assets/images/logo.png';
import aksen from '../assets/images/aksen.png';
import foto from '../assets/images/foto.png';
import AdminSidebar from './AdminSidebar';


const AdminMenu = () => {
  // Menu data based on the screenshot
  const menus = [
    { no: 1, name: 'Nasi Kebuli Ayam', description: 'Nasi kebuli dengan toping ayam', price: 'Rp. 20.000', picture: foto },
    { no: 2, name: 'Nasi Kebuli Ayam', description: 'Nasi kebuli dengan toping ayam', price: 'Rp. 20.000', picture: foto },
    { no: 3, name: 'Nasi Kebuli Ayam', description: 'Nasi kebuli dengan toping ayam', price: 'Rp. 20.000', picture: foto },
    { no: 4, name: 'Nasi Kebuli Ayam', description: 'Nasi kebuli dengan toping ayam', price: 'Rp. 20.000', picture: foto },
    { no: 5, name: 'Nasi Kebuli Ayam', description: 'Nasi kebuli dengan toping ayam', price: 'Rp. 20.000', picture: foto },
    { no: 6, name: 'Nasi Kebuli Ayam', description: 'Nasi kebuli dengan toping ayam', price: 'Rp. 20.000', picture: foto }
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

      {/* Sidebar */}
      <AdminSidebar activePage="menu" />

      {/* Main Content */}
      <div className="relative z-10 flex-1 ml-52 p-6">
        {/* Header with Menu and Admin in a box */}
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
            <h2 className="font-bold text-gray-800">Menu</h2>
            <Link to="/admin/menu/add" className="flex items-center bg-red-800 text-white px-3 py-1 rounded-lg text-sm">
              <FaPlus className="mr-1" />
              <span>Add Menu</span>
            </Link>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full">
              <thead>
                <tr className="bg-red-800 text-white text-center">
                  <th className="py-2 px-3 text-xs">NO</th>
                  <th className="py-2 px-3 text-xs">NAME</th>
                  <th className="py-2 px-3 text-xs">DESCRIPTION</th>
                  <th className="py-2 px-3 text-xs">PRICE</th>
                  <th className="py-2 px-3 text-xs">PICTURE</th>
                  <th className="py-2 px-3 text-xs">EDIT</th>
                </tr>
              </thead>
              <tbody>
                {menus.map((menu) => (
                  <tr
                    key={menu.no}
                    className="border-b border-gray-200 text-center hover:bg-gray-50 transition-colors"
                  >
                    <td className="py-2 px-3 text-xs">{menu.no}</td>
                    <td className="py-2 px-3 text-xs text-red-800">{menu.name}</td>
                    <td className="py-2 px-3 text-xs text-left text-red-800">{menu.description}</td>
                    <td className="py-2 px-3 text-xs text-red-800">{menu.price}</td>
                    <td className="py-2 px-3">
                      <div className="flex justify-center">
                        <img src={menu.picture} alt={menu.name} className="h-12 w-12 rounded-full object-cover" />
                      </div>
                    </td>
                    <td className="py-2 px-3">
                      <div className="flex justify-center space-x-2">
                        <Link to={`/admin/menu/edit/${menu.no}`} className="text-red-800 hover:text-red-600">
                          <FaPencilAlt size={14} />
                        </Link>
                        <button className="text-red-800 hover:text-red-600">
                          <FaTrash size={14} />
                        </button>
                      </div>
                    </td>
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

export default AdminMenu;