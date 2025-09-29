"use client";

export default function Toast({
  msg,
  type,
  onClose,
}: {
  msg: string;
  type: "success" | "error";
  onClose: () => void;
}) {
  return (
    <div
      className={`toast ${type}`}
      onClick={onClose}
      role="alert"
    >
      {msg}
    </div>
  );
}
