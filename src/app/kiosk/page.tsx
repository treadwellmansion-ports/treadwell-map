import { GuestMap } from "@/components/map/GuestMap";

// Lobby kiosk: fullscreen, loads straight into the bounded downtown view,
// no location-permission prompt, no "pick a starting point" step (Section 11).
export default function KioskPage() {
  return (
    <div className="fixed inset-0">
      <GuestMap variant="kiosk" />
    </div>
  );
}
