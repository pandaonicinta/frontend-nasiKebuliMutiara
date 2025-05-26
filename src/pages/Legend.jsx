import { useEffect } from "react";
import { useMap } from "react-leaflet";
import L from "leaflet";
// image import
import successImg from '../assets/images/success.png';
import otwImg from '../assets/images/otw.png';
import pendingImg from '../assets/images/pending.png';
import failedImg from '../assets/images/failed.png';
import shopImg from '../assets/images/shop.png';

const LegendControl = () => {
  const map = useMap();

  useEffect(() => {
    const legend = L.control({ position: "bottomleft" });

    legend.onAdd = () => {
      const div = L.DomUtil.create("div", "legend");
      div.innerHTML = `
    <h3><center>Legenda</center></h3>
<div style="display: flex; align-items: center; gap: 8px;">
  <img src="${successImg}" style="width: 20px; height: 20px;" /> Selesai
</div>
<div style="display: flex; align-items: center; gap: 8px;">
  <img src="${otwImg}" style="width: 20px; height: 20px;" /> Sedang Dikirim
</div>
<div style="display: flex; align-items: center; gap: 8px;">
  <img src="${pendingImg}" style="width: 20px; height: 20px;" /> Sedang Dimasak
</div>
<div style="display: flex; align-items: center; gap: 8px;">
  <img src="${failedImg}" style="width: 20px; height: 20px;" /> Dibatalkan
</div>
<div style="display: flex; align-items: center; gap: 8px;">
  <img src="${shopImg}" style="width: 20px; height: 20px;" /> Nasi Kebuli Mutiara
</div>

  `;
      return div;
    };

    legend.addTo(map);

    return () => {
      legend.remove();
    };
  }, [map]);

  return null;
};

export default LegendControl;
