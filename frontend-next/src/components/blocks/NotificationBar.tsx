export default function NotificationBar({
  message,
  type,
  onClose,
}: {
  message: string;
  type: "success" | "error";
  onClose: () => void;
}) {
  if (!message) return null;

  return (
    <div
      className={`toast ${type}`}
      onClick={onClose}
      title="Click to dismiss"
    >
      {message}
    </div>
  );
}
