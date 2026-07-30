import { GuestMap } from "@/components/map/GuestMap";

// Optional mobile visitor map -- same data/behavior as the kiosk, standalone page.
export default function MobileMapPage() {
  return (
    <div className="fixed inset-0">
      <GuestMap variant="mobile" />
    </div>
  );
}
