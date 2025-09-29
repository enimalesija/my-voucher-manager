export default function ConfirmModal({
  open,
  title,
  desc,
  confirmLabel = "Confirm",
  tone = "danger",
  onConfirm,
  onCancel,
}: {
  open: boolean;
  title: string;
  desc?: string;
  confirmLabel?: string;
  tone?: "danger" | "primary";
  onConfirm: () => void;
  onCancel: () => void;
}) {
  if (!open) return null;
  return (
    <div className="modal-backdrop" onClick={onCancel}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-title">{title}</div>
        {desc && <div className="modal-desc">{desc}</div>}
        <div
          className="row"
          style={{ justifyContent: "flex-end", marginTop: 14 }}
        >
          <button className="btn btn-ghost" onClick={onCancel}>
            Cancel
          </button>
          <button
            className={`btn ${
              tone === "danger" ? "btn-danger" : "btn-primary"
            }`}
            onClick={onConfirm}
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
