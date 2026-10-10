import { Instagram } from "lucide-react";

function ShareButtons() {
  return (
    <div className="flex flex-wrap items-center gap-3">
      <a
        href="https://www.instagram.com/nitkphotography/?hl=en"
        target="_blank"
        rel="noreferrer"
        className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-secondary transition hover:border-primary focus:outline-none focus:ring-2 focus:ring-primary"
        aria-label="NITK Photography on Instagram"
        title="NITK Photography on Instagram"
      >
        <Instagram size={18} />
      </a>
    </div>
  );
}

export default ShareButtons;
