import { Toaster as Sonner } from "sonner";

const Toaster = ({
  ...props
}) => {
  return (
    <Sonner
      theme="light"
      className="toaster group"
      style={
        {
          "--normal-bg": "rgba(255,255,255,0.45)",
          "--normal-text": "#111827",
          "--normal-border": "rgba(255,255,255,0.35)",
          "--success-bg": "rgba(34,197,94,0.18)",
          "--success-text": "#065f46",
          "--error-bg": "rgba(244,63,94,0.18)",
          "--error-text": "#7f1d1d",
          "--warning-bg": "rgba(234,179,8,0.18)",
          "--warning-text": "#78350f",
        }
      }
      {...props} />
  );
}

export { Toaster }
