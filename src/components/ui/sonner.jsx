import { Toaster as Sonner } from "sonner";

const Toaster = ({
  ...props
}) => {
  return (
    <Sonner
      theme="light"
      className="toaster group"
      style={{
        zIndex: 9999,
        "--normal-bg": "rgba(248,252,255,0.78)",
        "--normal-text": "#203344",
        "--normal-border": "rgba(93,124,146,0.18)",
        "--success-bg": "rgba(120,201,197,0.18)",
        "--success-text": "#1d5b60",
        "--error-bg": "rgba(213,140,157,0.18)",
        "--error-text": "#7b3046",
        "--warning-bg": "rgba(175,200,240,0.2)",
        "--warning-text": "#365675",
      }}
      {...props}
    />
  );
}

export { Toaster }
