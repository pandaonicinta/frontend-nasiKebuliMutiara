// Map.jsx
import React, { use, useEffect, useState } from 'react';
import { MapContainer, Marker, Popup, TileLayer, useMap } from "react-leaflet";
import { Icon } from 'leaflet';
import "leaflet/dist/leaflet.css";
import LegendControl from './Legend';
import RoutingMachine from './RoutingMachine';
import axios from 'axios';
// image import
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
  useEffect(() => {
    const token = localStorage.getItem('token');
    const defaultMarkers =[
        {
          latitude: -6.340524556872198, 
          longitude: 107.11309999756057,
          label: "Nasi Kebuli Mutiara",
          status: "home"
        }
      ]
    axios.get(`${API_BASE_URL}/api/dashboard/order`,{
      headers: {
        Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    }
  })
  .then(response => {
      console.log(response.data)
      let responseData = response.data
      .filter(item => item.alamat && item.alamat.latitude && item.alamat.longitude && item.status !== "pending")
          .map(item => ({
            latitude: parseFloat(item.alamat.latitude),
            longitude: parseFloat(item.alamat.longitude),
            status: item.status,
            label: `Status: <b> ${item.status}</b> <br /> Customer a.n. ${item.nama_pembeli}<br />${item.alamat.label_alamat} - ${item.alamat.nama_penerima} <br />${item.alamat.detail}`
            // label: "tes "
          }));
          if (statusFilter) {
            responseData = responseData.filter(marker => marker.status === statusFilter);
          }
          const allMarkers = [...responseData, ...defaultMarkers]
          setMarkers(allMarkers);
          // routing sementara
          if (responseData.length > 0) {
            setDestination({lat: 0,
            lng: 0  
            });
          } else {
            setDestination({lat: defaultMarkers[0].latitude,
            lng: defaultMarkers[0].longitude  
            }
            );
          }
        })
      }, [statusFilter])


  
const failedIcon = new Icon({
  iconUrl: failedImg,
  iconSize: [38, 38]
});

const defaultIcon = new Icon({
  iconUrl: pendingImg,
  iconSize: [38, 38]
});

const successIcon = new Icon({
  iconUrl: successImg,
  iconSize: [38, 38]
});

const homeIcon = new Icon({
  iconUrl: shopImg,
  iconSize: [38, 38]
});
const ondelIcon = new Icon({
  iconUrl: otwImg,
  iconSize: [38, 38]
});


  return (
    <div className="map-wrapper">
      <div className="filter-container">
        <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)}>
          <option value="">All Status</option>
          <option value="on process">On Process</option>
          <option value="on deliver">On Deliver</option>
          <option value="success">Completed</option>
          <option value="canceled">Canceled</option>
        </select>
      </div>
    <MapContainer center={[-6.340524556872198, 107.11309999756057]} zoom={13} style={{ height: '100vh', width: '100%' }}>
      <LegendControl></LegendControl>
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        url='https://tile.openstreetmap.org/{z}/{x}/{y}.png'
      />
      {markers.map((marker, index) => (
        <Marker
          key={index}
          position={[marker.latitude, marker.longitude]}
          icon={marker.status !== 'canceled' && marker.status !== 'success' && marker.status !== 'home' && marker.status !== 'on deliver' ? defaultIcon : marker.status !== 'canceled' && marker.status !== 'home' && marker.status !== 'on deliver' ? successIcon : marker.status !== 'home' && marker.status !== 'on deliver' ? failedIcon : marker.status !== 'on deliver' ? homeIcon : ondelIcon}
          eventHandlers={{
            click: () => {
                setDestination({lat: marker.latitude, lng: marker.longitude });
            }
          }}>

          <Popup><div dangerouslySetInnerHTML={{ __html: marker.label }} /></Popup>
        </Marker>
      ))}
      <RoutingMachine lat={destination.lat} lng={destination.lng} />
    </MapContainer>
    </div>
  );
};

export default MapComponent;
