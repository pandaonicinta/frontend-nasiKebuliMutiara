// Map.jsx
import React, { use, useEffect, useState } from 'react';
import { MapContainer, Marker, Popup, TileLayer, useMap } from "react-leaflet";
import { Icon } from 'leaflet';
import "leaflet/dist/leaflet.css";
import LegendControl from './Legend';
import RoutingMachine from './RoutingMachine';
import axios from 'axios';


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
    axios.get('http://127.0.0.1:8000/api/dashboard/order',{
      headers: {
        Authorization: `Bearer 2|8PBZ7APaswPCfOvcDuUEES8SY6UWf2XhtS9CkCej53318b2a`
      }
    })
    .then(response => {
      let responseData = response.data
      .filter(item => item.alamat && item.alamat.latitude && item.alamat.longitude)
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
    iconUrl: require("./img/failed.png"),
    iconSize: [38, 38]
  });
  const defaultIcon = new Icon({
    iconUrl: require("./img/pending.png"),
    iconSize: [38, 38]
  });
  const successIcon = new Icon({
    iconUrl: require("./img/success.png"),
    iconSize: [38, 38]
  });
  const homeIcon = new Icon({
    iconUrl: require("./img/shop.png"),
    iconSize: [38, 38]
  });


  return (
    <div className="map-wrapper">
      <div className="filter-container">
        <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)}>
          <option value="">All Status</option>
          <option value="pending">On Process</option>
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
          icon={marker.status !== 'canceled' && marker.status !== 'success' && marker.status !== 'home' ? defaultIcon : marker.status !== 'canceled' && marker.status !== 'home' ? successIcon : marker.status !== 'home' ? failedIcon : homeIcon}
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
