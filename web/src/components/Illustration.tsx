import avocado from "../assets/illustrations/avocado.svg";
import basil from "../assets/illustrations/basil.svg";
import bento from "../assets/illustrations/bento.svg";
import bread from "../assets/illustrations/bread.svg";
import eggs from "../assets/illustrations/eggs.svg";
import eggsMap from "../assets/illustrations/eggs_map.svg";
import groupKorean from "../assets/illustrations/group-korean.svg";
import groupVeggie from "../assets/illustrations/group-veggie.svg";
import kimchi from "../assets/illustrations/kimchi.svg";
import rice from "../assets/illustrations/rice.svg";
import ricecooker from "../assets/illustrations/ricecooker.svg";
import spinach from "../assets/illustrations/spinach.svg";
import tofu from "../assets/illustrations/tofu.svg";

/** Flat, no-outline food illustrations. Palette colors plus one food color each. */
export const illustrations = { avocado, basil, bento, bread, eggs, eggsMap, groupKorean, groupVeggie, kimchi, rice, ricecooker, spinach, tofu };
export type IllustrationName = keyof typeof illustrations;

export function Illustration({ name, size = 52, label }: { name: IllustrationName; size?: number; label?: string }) {
  return <img src={illustrations[name]} width={size} height={size} alt={label ?? ""} style={{ display: "block" }} />;
}
