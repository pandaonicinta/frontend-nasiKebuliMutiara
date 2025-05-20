import { useEffect } from "react";
import { useMap } from "react-leaflet";
import L from "leaflet";

const LegendControl = () => {
  const map = useMap();

  useEffect(() => {
    const legend = L.control({ position: "bottomleft" });

    legend.onAdd = () => {
      const div = L.DomUtil.create("div", "legend");
      div.innerHTML = `
        <h3><center>Legend</center></h3><br />
        <div><img src="${require('./img/success.png')}" style="width: 20px; height: 20px; vertical-align: middle;" /> Completed</div>
        <div><img src="${require('./img/otw.png')}" style="width: 20px; height: 20px; vertical-align: middle;" /> On Deliver</div>
        <div><img src="${require('./img/pending.png')}" style="width: 20px; height: 20px; vertical-align: middle;" /> On Process</div>
        <div><img src="${require('./img/failed.png')}" style="width: 20px; height: 20px; vertical-align: middle;" /> Canceled</div>
        <div><img src="${require('./img/shop.png')}" style="width: 20px; height: 20px; vertical-align: middle;" /> Nasi Kebuli Mutiara</div>
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
