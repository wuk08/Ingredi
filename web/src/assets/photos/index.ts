// Real food photos (top-down, natural light). Import from here, not from the folder.
import bibimbap from "./bibimbap.jpg";
import cheesyTomatoOmelette from "./cheesy-tomato-omelette.jpg";
import chickenSpinachStirFry from "./chicken-spinach-stir-fry.jpg";
import eggDropSoup from "./egg-drop-soup.jpg";
import japchae from "./japchae.jpg";
import kimchiFriedRice from "./kimchi-fried-rice.jpg";
import kimchiJjigae from "./kimchi-jjigae.jpg";
import kimchiTofuSoup from "./kimchi-tofu-soup.jpg";
import shakshuka from "./shakshuka.jpg";
import spicyPork from "./spicy-pork.jpg";
import spinachEggScramble from "./spinach-egg-scramble.jpg";
import spinachTofuBowl from "./spinach-tofu-bowl.jpg";
import threeAvos from "./three-avos.png";

export const photos = {
  "bibimbap": bibimbap,
  "cheesy-tomato-omelette": cheesyTomatoOmelette,
  "chicken-spinach-stir-fry": chickenSpinachStirFry,
  "egg-drop-soup": eggDropSoup,
  "japchae": japchae,
  "kimchi-fried-rice": kimchiFriedRice,
  "kimchi-jjigae": kimchiJjigae,
  "kimchi-tofu-soup": kimchiTofuSoup,
  "shakshuka": shakshuka,
  "spicy-pork": spicyPork,
  "spinach-egg-scramble": spinachEggScramble,
  "spinach-tofu-bowl": spinachTofuBowl,
  "three-avos": threeAvos,
} as const;

export type PhotoName = keyof typeof photos;
