import { BadgeCheck, MessageCircle, Phone, Truck } from "lucide-react";
import { TIER_LABEL, displayPhone, telHref, whatsappHref, type Vendor } from "@/lib/vendors";
import { Avatar } from "./avatar";
import { Stars } from "./stars";

export function VendorCard({
  vendor, tier, note, message,
}: { vendor: Vendor; tier?: 0 | 1 | 2 | 3; note?: string; message: string }) {
  return (
    <div className="vendor-card" data-testid="vendor-card">
      <div className="top">
        <Avatar name={vendor.name} />
        <div style={{ minWidth: 0 }}>
          <div className="row-title" style={{ fontSize: 15 }}>
            {vendor.name} {vendor.verified && <BadgeCheck size={15} color="#01875f" aria-label="Verified" />}
          </div>
          <div className="row-sub">{vendor.area}, {vendor.city}</div>
          <div className="row-meta">
            <Stars rating={vendor.rating} reviews={vendor.reviews} />
            {tier !== undefined && <span className={`badge ${tier === 0 ? "badge-ready" : "badge-grey"}`}>{TIER_LABEL[tier]}</span>}
          </div>
        </div>
      </div>
      {note && <div className="small muted">{note}</div>}
      <div className="row small muted" style={{ gap: 6 }}>
        {vendor.delivers && <><Truck size={14} /> Delivers to site</>}
      </div>
      <div className="call-row">
        <a className="btn btn-primary btn-sm" href={telHref(vendor.phone)} aria-label={`Call ${vendor.name} on ${displayPhone(vendor.phone)}`}>
          <Phone size={15} /> {displayPhone(vendor.phone)}
        </a>
        {vendor.whatsapp && (
          <a className="btn btn-outline btn-sm" href={whatsappHref(vendor.phone, message)} target="_blank" rel="noreferrer" aria-label={`WhatsApp ${vendor.name}`} style={{ flex: "0 0 auto" }}>
            <MessageCircle size={15} /> WhatsApp
          </a>
        )}
      </div>
    </div>
  );
}
