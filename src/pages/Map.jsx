import React, { useEffect, useState } from 'react';
import { MapContainer, Marker, Popup, TileLayer, Circle } from "react-leaflet";
import { Icon } from 'leaflet';
import "leaflet/dist/leaflet.css";
import LegendControl from './Legend';
import RoutingMachine from './RoutingMachine';
import axios from 'axios';
import MarkerClusterGroup from "react-leaflet-cluster";

// image imports
import failedImg from '../assets/images/failed.png';
import pendingImg from '../assets/images/pending.png';
import successImg from '../assets/images/success.png';
import shopImg from '../assets/images/shop.png';
import otwImg from '../assets/images/otw.png';

const API_BASE_URL = 'http://kebabmutiara.xyz';

const MapComponent = () => {
  const [destination, setDestination] = useState({
    lat: -6.340524556872198,
    lng: 107.11309999756057
  });

  const [statusFilter, setStatusFilter] = useState('');
  const [markers, setMarkers] = useState([]);
  const [startDate, setStartDate] = useState('');
  const [radius, setRadius] = useState(1000); // default nya: 1000 meters
  const [radiusEnabled, setRadiusEnabled] = useState(true);
  const [allDates, setAllDates] = useState(false);


function isInsideRadius(lat1, lng1, lat2, lng2, radiusMeters) {
    const R = 6371e3; // Earth's radius in meters
    const toRad = x => x * Math.PI / 180;
    const dLat = toRad(lat2 - lat1);
    const dLon = toRad(lng2 - lng1);
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) *
      Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    const distance = R * c;
    return distance <= radiusMeters;
  }

  const statusTranslations = {
  "on process": "Sedang Dimasak",
  "on deliver": "Sedang Dikirim",
  "delivered": "Selesai",
  "cancelled": "Dibatalkan" 
};



  useEffect(() => {
    const token = localStorage.getItem('token');
    const defaultMarkers = [
      {
        latitude: -6.340524556872198,
        longitude: 107.11309999756057,
        label: "Nasi Kebuli Mutiara",
        status: "home"
      }
    ];
   
    if (!startDate) {
      const oneWeekAgo = new Date();
      oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
      setStartDate(oneWeekAgo.toISOString().split('T')[0]);
    }

    axios.get(`${API_BASE_URL}/api/dashboard/order`, {
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      }
    }).then(response => {
      let responseData = response.data
        .filter(item => item.alamat && item.alamat.latitude && item.alamat.longitude && item.status !== "pending")
          .filter(item => {
            const matchesStatus = statusFilter ? item.status === statusFilter : true;
            const matchesDate = allDates
              ? true : (() => {
                  const itemDateRaw = item.tanggal_pembelian.split(' ')[0]; 
                  const [day, monthStr, year] = itemDateRaw.split('-');
                  const itemDate = new Date(`${monthStr} ${day}, ${year}`);
                  const start = new Date(startDate);
                  const today = new Date();

                  return itemDate >= start && itemDate <= today;
                })();

            return matchesStatus && matchesDate;
          })
        .map(item => ({
          latitude: parseFloat(item.alamat.latitude),
          longitude: parseFloat(item.alamat.longitude),
          status: item.status,
          label: `Status: <b> ${statusTranslations[item.status]}</b> <br /> Customer a.n. ${item.nama_pembeli}<br />${item.alamat.label_alamat} - ${item.alamat.nama_penerima} <br />${item.alamat.detail}`,
          isInsideRadius: isInsideRadius(
          defaultMarkers[0].latitude,
          defaultMarkers[0].longitude,
          parseFloat(item.alamat.latitude),
          parseFloat(item.alamat.longitude),
          radius
        )
        }))
        .filter(marker => radiusEnabled ? marker.isInsideRadius : true);

      if (statusFilter) {
        responseData = responseData.filter(marker => marker.status === statusFilter);
      }

      const allMarkers = [...responseData, ...defaultMarkers];
      setMarkers(allMarkers);
      

      setDestination(responseData.length > 0
        ? { lat: 0, lng: 0 }
        : { lat: defaultMarkers[0].latitude, lng: defaultMarkers[0].longitude });
    });
  }, [statusFilter, startDate, radius, radiusEnabled, allDates]);

  const failedIcon = new Icon({ iconUrl: failedImg, iconSize: [38, 38] });
  const defaultIcon = new Icon({ iconUrl: pendingImg, iconSize: [38, 38] });
  const successIcon = new Icon({ iconUrl: successImg, iconSize: [38, 38] });
  const homeIcon = new Icon({ iconUrl: shopImg, iconSize: [38, 38] });
  const ondelIcon = new Icon({ iconUrl: otwImg, iconSize: [38, 38] });

  const getIcon = (status) => {
    if (status === 'cancelled') return failedIcon;
    if (status === 'delivered') return successIcon;
    if (status === 'home') return homeIcon;
    if (status === 'on deliver') return ondelIcon;
    return defaultIcon;
  };

  return (
    <div className="relative map-wrapper">
    {/* Filters Container */}
    <div className="filter-container flex gap-4 items-center p-4 bg-white shadow-md rounded-md z-[999] absolute top-4 left-4">
      <label className="text-sm font-semibold">
        Status:
        <select
          value={statusFilter}
          onChange={e => setStatusFilter(e.target.value)}
          className="ml-2 border border-gray-300 rounded px-2 py-1"
        >
          <option value="">Tampilkan Semua</option>
          <option value="on process">Sedang Dimasak</option>
          <option value="on deliver">Sedang Dikirim</option>
          <option value="delivered">Selesai</option>
          <option value="cancelled">Dibatalkan</option>
        </select>
      </label>

      <label className="text-sm font-semibold">
        Mulai Dari:
        <input
          type="date"
          value={startDate}
          onChange={e => setStartDate(e.target.value)}
          className="ml-2 border border-gray-300 rounded px-2 py-1"
          disabled={allDates}
        />
      </label>
      <label className="text-sm font-semibold flex items-center gap-2">
        <input
          type="checkbox"
          checked={allDates}
          onChange={(e) => setAllDates(e.target.checked)}
        />
        Semua Tanggal
      </label>
    </div>

    {/* Radius Slider Box — outside filter-container */}
    <div className="absolute top-[140px] left-4 z-[999] bg-white shadow-lg rounded-lg p-2 flex flex-col items-center h-[300px] w-[60px] overflow-visible">
      <label className="text-xs font-semibold text-center mb-2">Radius</label>
        <input
            type="checkbox"
            checked={radiusEnabled}
            onChange={(e) => setRadiusEnabled(e.target.checked)}
            className="mb-2"
          />
      
      <div className="relative h-full flex justify-center items-center">

        <input
          type="range"
          min="100"
          max="20000"
          step="100"
          value={radius}
          onChange={e => setRadius(Number(e.target.value))}
          disabled={!radiusEnabled}
          className="absolute left-1/2 -translate-x-1/2 w-[180px] h-2 transform -rotate-90 origin-center appearance-none bg-gray-300 rounded-full cursor-pointer"
        />
      </div>

      <span className="text-[10px] mt-2">
        {(radius / 1000).toFixed(2)} km
      </span>
    </div>



      <MapContainer center={[-6.340524556872198, 107.11309999756057]} zoom={13} style={{ height: '100vh', width: '100%' }}>
        <LegendControl />
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url='https://tile.openstreetmap.org/{z}/{x}/{y}.png'
        />
        {radiusEnabled && (
        <Circle
          center={[-6.340524556872198, 107.11309999756057]}
          radius={radius}
          pathOptions={{ color: 'blue', fillColor: 'blue', fillOpacity: 0.1 }}
        />
        )}



        {markers
          .filter(marker => marker.status === 'home')
          .map((marker, index) => (
            <Marker
              key={`home-${index}`}
              position={[marker.latitude, marker.longitude]}
              icon={homeIcon}
              eventHandlers={{
                click: () => {
                  setDestination({ lat: marker.latitude, lng: marker.longitude });
                }
              }}
            >
              <Popup><div dangerouslySetInnerHTML={{ __html: marker.label }} /></Popup>
            </Marker>
          ))}
        <MarkerClusterGroup>
          {markers
            .filter(marker => marker.status !== 'home')
            .map((marker, index) => (
              <Marker
                key={index}
                position={[marker.latitude, marker.longitude]}
                icon={getIcon(marker.status)}
                eventHandlers={{
                  click: () => {
                    setDestination({ lat: marker.latitude, lng: marker.longitude });
                  }
                }}
              >
                <Popup><div dangerouslySetInnerHTML={{ __html: marker.label }} /></Popup>
              </Marker>
            ))}
        </MarkerClusterGroup>

        <RoutingMachine lat={destination.lat} lng={destination.lng} />
      </MapContainer>
    </div>
  );
};

export default MapComponent;
