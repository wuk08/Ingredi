/** Small line icons used across screens (24px grid, round caps). */
type P = { size?: number; color?: string };
const base = (size: number, color: string, w = 2) => ({ width: size, height: size, viewBox: "0 0 24 24", fill: "none", stroke: color, strokeWidth: w, strokeLinecap: "round" as const, strokeLinejoin: "round" as const, "aria-hidden": true });

export const BackIcon = ({ size = 20, color = "var(--text-primary)" }: P) => <svg {...base(size, color)}><path d="M15 5l-7 7 7 7" /></svg>;
export const CloseIcon = ({ size = 18, color = "var(--text-primary)" }: P) => <svg {...base(size, color, 2.2)}><path d="M6 6l12 12M18 6 6 18" /></svg>;
export const ChevronIcon = ({ size = 18, color = "var(--text-secondary)" }: P) => <svg {...base(size, color)}><path d="m9 5 7 7-7 7" /></svg>;
export const BookmarkIcon = ({ size = 20, color = "var(--text-primary)", filled = false }: P & { filled?: boolean }) => <svg {...base(size, color)} fill={filled ? color : "none"}><path d="M6 3h12v18l-6-4-6 4z" /></svg>;
export const SearchIcon = ({ size = 18, color = "var(--text-secondary)" }: P) => <svg {...base(size, color)}><circle cx="11" cy="11" r="7" /><path d="m20 20-3.5-3.5" /></svg>;
export const FilterIcon = ({ size = 18, color = "var(--text-primary)" }: P) => <svg {...base(size, color)}><path d="M4 6h16M7 12h10M10 18h4" /></svg>;
export const PlusIcon = ({ size = 24, color = "var(--text-primary)" }: P) => <svg {...base(size, color, 2.2)}><path d="M12 5v14M5 12h14" /></svg>;
export const ListIcon = ({ size = 18, color = "#fff" }: P) => <svg {...base(size, color)}><path d="M8 6h13M8 12h13M8 18h13M3 6h.01M3 12h.01M3 18h.01" /></svg>;
export const MapIcon = ({ size = 18, color = "#fff" }: P) => <svg {...base(size, color)}><path d="M9 4 3 6v14l6-2 6 2 6-2V4l-6 2z" /><path d="M9 4v14M15 6v14" /></svg>;
export const LocateIcon = ({ size = 20, color = "var(--text-primary)" }: P) => <svg {...base(size, color)}><circle cx="12" cy="12" r="4" /><path d="M12 2v3M12 19v3M2 12h3M19 12h3" /></svg>;
export const CameraIcon = ({ size = 22, color = "var(--text-secondary)" }: P) => <svg {...base(size, color, 1.8)}><path d="M4 8h3l2-3h6l2 3h3v11H4z" /><circle cx="12" cy="13" r="3.5" /></svg>;
export const MoreIcon = ({ size = 20, color = "var(--text-primary)" }: P) => <svg width={size} height={size} viewBox="0 0 24 24" fill={color} aria-hidden="true"><circle cx="5" cy="12" r="1.8" /><circle cx="12" cy="12" r="1.8" /><circle cx="19" cy="12" r="1.8" /></svg>;
export const SendIcon = ({ size = 20, color = "#fff" }: P) => <svg {...base(size, color)}><path d="M5 12h14M13 6l6 6-6 6" /></svg>;
export const CheckIcon = ({ size = 18, color = "var(--text-primary)" }: P) => <svg {...base(size, color, 2.4)}><path d="m5 12.5 4.5 4.5L19 7.5" /></svg>;
export const TrashIcon = ({ size = 20, color = "var(--text-secondary)" }: P) => <svg {...base(size, color)}><path d="M4 7h16M9 7V4h6v3M7 7l1 13h8l1-13M10 11v5M14 11v5" /></svg>;
