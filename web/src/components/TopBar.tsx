import type { ReactNode } from "react";
import { useNavigate } from "react-router-dom";
import { BackIcon, CloseIcon } from "./Icons";

/** Screen header: round back/close button, centered title, optional right slot. */
export function TopBar({ title, close, right, onBack }: { title?: string; close?: boolean; right?: ReactNode; onBack?: () => void }) {
  const nav = useNavigate();
  return (
    <header className="topbar">
      <button type="button" className="icon-btn" aria-label={close ? "Close" : "Back"} onClick={onBack ?? (() => (window.history.state?.idx ? nav(-1) : nav("/home")))}>
        {close ? <CloseIcon /> : <BackIcon />}
      </button>
      <h1 className="topbar__title">{title}</h1>
      {right ?? <span style={{ width: 44 }} />}
    </header>
  );
}
