import "leaflet/dist/leaflet.css";
import "leaflet-routing-machine/dist/leaflet-routing-machine.css";
import { useEffect, useRef } from 'react';
import { useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet-routing-machine';

const RoutingMachine = ({lat, lng}) => {
    const map = useMap();
    const routingControlRef = useRef(null);

    useEffect(() => {
        if (!map) return;
        if(lat === 0 && lng === 0){
          routingControlRef.current._clearLines();
          return;
        }

        
    if (!routingControlRef.current) {
      const control = L.Routing.control({
        waypoints: [
          L.latLng(-6.340524556872198, 107.11309999756057),
          L.latLng(lat, lng),
        ],
        routeWhileDragging: false,
        addWaypoints: false,
        createMarker: () => null,
      }).addTo(map);

      routingControlRef.current = control;
    } else {
      routingControlRef.current.setWaypoints([
        L.latLng(-6.340524556872198, 107.11309999756057),
        L.latLng(lat, lng),
      ]);
    }

    return () => {
      };
    }, [map, lat, lng]);
    return null;
  };

export default RoutingMachine;