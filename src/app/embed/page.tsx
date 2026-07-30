import { GuestMap } from "@/components/map/GuestMap";

// Website embed: sized to whatever <iframe> the Treadwell site wraps it in,
// rather than assuming the full viewport like kiosk/mobile do.
export default function EmbedPage() {
  return (
    <div className="h-screen w-screen">
      <GuestMap variant="embed" />
    </div>
  );
}
