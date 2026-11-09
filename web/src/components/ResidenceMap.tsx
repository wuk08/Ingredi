import { useEffect, useRef, useState } from "react";
import mapWorkerUrl from "maplibre-gl/dist/maplibre-gl-worker.mjs?url";
import { defaultView, mountMap } from "../../../public/lib/nearby-map.mjs";
import residenceStyle from "../../../public/maps/residence-style.json";
import { LocateIcon } from "./Icons";

type Props = {
  location: [number, number];
  posts: any[];
  selected?: string;
  residenceId?: string;
  residenceName?: string;
  scope: "building" | "neighborhood";
  onSelect: (id: string) => void;
};

const loadMapLibre = () => import("maplibre-gl");

export function ResidenceMap({ location, posts, selected, residenceId, residenceName, scope, onSelect }: Props) {
  const element = useRef<HTMLDivElement>(null);
  const view = useRef(defaultView(location));
  const [centerRequest, setCenterRequest] = useState(0);
  const locationKey = `${location[0]},${location[1]}`;

  useEffect(() => {
    view.current = { ...defaultView(location), zoom: scope === "building" ? 17 : 14 };
  }, [centerRequest, locationKey, residenceId, scope]);

  useEffect(() => {
    if (!element.current) return;
    element.current.replaceChildren();
    return mountMap({
      element: element.current,
      posts,
      selected,
      view: view.current,
      location,
      residenceId,
      residenceName,
      mapStyle: residenceStyle,
      onSelect,
      onView: (next: { center: [number, number]; zoom: number }) => { view.current = next; },
    }, { loadLibrary: loadMapLibre, workerUrl: mapWorkerUrl });
  }, [centerRequest, locationKey, onSelect, posts, residenceId, residenceName, scope, selected]);

  return <div className="real-nearby-map">
    <div ref={element} className="real-nearby-map__canvas map-canvas" aria-label={`Interactive street map centered on ${residenceName || "your residence"}`} />
    <button type="button" className="icon-btn real-nearby-map__center" aria-label="Center on my residence" onClick={() => setCenterRequest((value) => value + 1)}><LocateIcon /></button>
  </div>;
}
