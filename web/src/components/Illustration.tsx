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

/** Match pantry items and recipes to the original pre-revamp food artwork. */
export function illustrationFor(value: string): IllustrationName {
  const name = value.toLowerCase();
  if (/avocado/.test(name)) return "avocado";
  if (/egg|omelet|omelette/.test(name)) return "eggs";
  if (/bread|toast/.test(name)) return "bread";
  if (/tofu/.test(name)) return "tofu";
  if (/kimchi/.test(name)) return "kimchi";
  if (/rice cooker/.test(name)) return "ricecooker";
  if (/bibimbap|japchae|korean|jjigae|pork|stir.fry|soup/.test(name)) return "groupKorean";
  if (/rice/.test(name)) return "rice";
  if (/spinach|salad|vegetable|carrot|onion|garlic|tomato/.test(name)) return "spinach";
  if (/basil|herb|green onion/.test(name)) return "basil";
  if (/milk|cheese|chicken|bento/.test(name)) return "bento";
  return "groupVeggie";
}

export function Illustration({ name, size = 52, label, className }: { name: IllustrationName; size?: number; label?: string; className?: string }) {
  return <img className={className} src={illustrations[name]} width={size} height={size} alt={label ?? ""} style={{ display: "block" }} />;
}
