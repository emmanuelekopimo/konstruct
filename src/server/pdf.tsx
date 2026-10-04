import path from "node:path";
import { Document, Font, Page, Path, Rect, StyleSheet, Svg, Text, View, renderToBuffer } from "@react-pdf/renderer";
import {
  CONTINGENCY_RATE, STATUS_LABEL, priceValidUntil, quoteRef, type Breakdown, type PlanStatus,
} from "@/lib/breakdown";
import { formatDay } from "@/lib/dates";
import { formatQty, naira } from "@/lib/money";
import { TIER_LABEL, displayPhone, type Vendor } from "@/lib/vendors";

const fontDir = path.join(process.cwd(), "assets", "fonts");
Font.register({
  family: "Roboto",
  fonts: [
    { src: path.join(fontDir, "roboto-400.ttf"), fontWeight: 400 },
    { src: path.join(fontDir, "roboto-500.ttf"), fontWeight: 500 },
    { src: path.join(fontDir, "roboto-700.ttf"), fontWeight: 700 },
  ],
});
Font.register({
  family: "GoogleSans",
  fonts: [
    { src: path.join(fontDir, "google-sans-500.ttf"), fontWeight: 500 },
    { src: path.join(fontDir, "google-sans-700.ttf"), fontWeight: 700 },
  ],
});
Font.registerHyphenationCallback((w) => [w]);

const GREEN = "#01875f";
const TEXT = "#202124";
const MUTED = "#5f6368";
const LINE = "#dadce0";

const s = StyleSheet.create({
  page: { fontFamily: "Roboto", fontSize: 9, color: TEXT, paddingTop: 36, paddingBottom: 54, paddingHorizontal: 36 },
  header: { flexDirection: "row", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 14 },
  brand: { flexDirection: "row", alignItems: "center" },
  brandName: { fontFamily: "GoogleSans", fontWeight: 700, fontSize: 18, marginLeft: 8 },
  docTitle: { fontFamily: "GoogleSans", fontWeight: 700, fontSize: 14, color: GREEN, textAlign: "right" },
  meta: { fontSize: 8.5, color: MUTED, textAlign: "right", marginTop: 2 },
  rule: { height: 2, backgroundColor: GREEN, marginBottom: 14 },
  cols: { flexDirection: "row", gap: 12, marginBottom: 14 },
  box: { flex: 1, borderWidth: 1, borderColor: LINE, borderRadius: 6, padding: 10 },
  label: { fontSize: 7.5, color: MUTED, textTransform: "uppercase", letterSpacing: 0.6, marginBottom: 2 },
  value: { fontSize: 10, fontWeight: 500, marginBottom: 6 },
  h1: { fontFamily: "GoogleSans", fontWeight: 700, fontSize: 16, marginBottom: 4 },
  h2: { fontFamily: "GoogleSans", fontWeight: 700, fontSize: 12, marginBottom: 8, marginTop: 6 },
  kpis: { flexDirection: "row", gap: 8, marginBottom: 14 },
  kpi: { flex: 1, backgroundColor: "#f8faf9", borderRadius: 6, padding: 10 },
  kpiMain: { flex: 1.4, backgroundColor: GREEN, borderRadius: 6, padding: 10 },
  kpiValue: { fontSize: 13, fontWeight: 700 },
  note: { backgroundColor: "#fef7e0", color: "#5c3c00", borderRadius: 6, padding: 8, marginBottom: 12, fontSize: 8.5 },
  th: { flexDirection: "row", backgroundColor: "#f1f3f4", paddingVertical: 5, paddingHorizontal: 6, fontWeight: 700, fontSize: 8 },
  cat: { flexDirection: "row", justifyContent: "space-between", backgroundColor: "#e6f4ea", paddingVertical: 5, paddingHorizontal: 6, marginTop: 6 },
  catName: { fontFamily: "GoogleSans", fontWeight: 700, fontSize: 9.5, color: "#056449" },
  tr: { flexDirection: "row", paddingVertical: 4, paddingHorizontal: 6, borderBottomWidth: 0.5, borderBottomColor: LINE },
  cNo: { width: 20, color: MUTED },
  cDesc: { flex: 1, paddingRight: 6 },
  cQty: { width: 50, textAlign: "right" },
  cUnit: { width: 40, paddingLeft: 6 },
  cRate: { width: 66, textAlign: "right" },
  cAmt: { width: 76, textAlign: "right" },
  totals: { marginTop: 10, marginLeft: "auto", width: 240 },
  totRow: { flexDirection: "row", justifyContent: "space-between", paddingVertical: 3 },
  grand: { flexDirection: "row", justifyContent: "space-between", borderTopWidth: 1.5, borderTopColor: TEXT, paddingTop: 6, marginTop: 4 },
  vRow: { flexDirection: "row", paddingVertical: 5, paddingHorizontal: 6, borderBottomWidth: 0.5, borderBottomColor: LINE },
  footer: { position: "absolute", bottom: 24, left: 36, right: 36, flexDirection: "row", justifyContent: "space-between", fontSize: 7.5, color: MUTED, borderTopWidth: 0.5, borderTopColor: LINE, paddingTop: 6 },
});

function Logo() {
  return (
    <Svg width={26} height={26} viewBox="0 0 64 64">
      <Rect x={0} y={0} width={64} height={64} rx={16} ry={16} fill={GREEN} />
      <Path d="M12 30 L32 14 L52 30" stroke="#ffffff" strokeWidth={5} fill="none" />
      <Rect x={18} y={30} width={28} height={22} fill="#ffffff" />
      <Path d="M27 34 V48 M27 41 L36 34 M29 40 L37 48" stroke={GREEN} strokeWidth={3.6} fill="none" />
    </Svg>
  );
}

export type PdfInput = {
  plan: {
    id: number; title: string; city: string; state: string; buildingType: string; floors: number;
    bedrooms: number; floorAreaM2: number; fileName: string; summary: string; assumptions: string[];
    pricedOn: string;
  };
  owner: { name: string; email: string };
  breakdown: Breakdown;
  status: PlanStatus;
  vendorsByCategory: { category: string; vendors: (Vendor & { tier: 0 | 1 | 2 | 3 })[] }[];
  today: string;
};

const TYPE: Record<string, string> = {
  bungalow: "Bungalow", duplex: "Duplex", block_of_flats: "Block of flats", commercial: "Commercial", other: "Building",
};

export function EstimateDocument({ plan, owner, breakdown: b, status, vendorsByCategory, today }: PdfInput) {
  const ref = quoteRef(plan.id, plan.pricedOn);
  let n = 0;
  return (
    <Document title={`${plan.title} - material estimate`} author="Konstruct" subject={ref} creator="Konstruct">
      <Page size="A4" style={s.page}>
        <View style={s.header} fixed>
          <View style={s.brand}><Logo /><Text style={s.brandName}>Konstruct</Text></View>
          <View>
            <Text style={s.docTitle}>MATERIAL ESTIMATE</Text>
            <Text style={s.meta}>Ref {ref}</Text>
            <Text style={s.meta}>Priced {formatDay(plan.pricedOn)}, valid until {formatDay(priceValidUntil(plan.pricedOn))}</Text>
          </View>
        </View>
        <View style={s.rule} fixed />

        <Text style={s.h1}>{plan.title}</Text>
        <Text style={{ color: MUTED, marginBottom: 12 }}>
          {TYPE[plan.buildingType] ?? "Building"}{plan.bedrooms > 0 ? `, ${plan.bedrooms} bedrooms` : ""}, {plan.floors} floor{plan.floors > 1 ? "s" : ""}, about {plan.floorAreaM2} m2. Site: {plan.city}, {plan.state}.
        </Text>

        <View style={s.cols}>
          <View style={s.box}>
            <Text style={s.label}>Prepared for</Text>
            <Text style={s.value}>{owner.name}</Text>
            <Text style={s.label}>Email</Text>
            <Text style={[s.value, { marginBottom: 0 }]}>{owner.email}</Text>
          </View>
          <View style={s.box}>
            <Text style={s.label}>Plan file</Text>
            <Text style={s.value}>{plan.fileName}</Text>
            <Text style={s.label}>Status</Text>
            <Text style={[s.value, { marginBottom: 0 }]}>{STATUS_LABEL[status]}, issued {formatDay(today)}</Text>
          </View>
        </View>

        <View style={s.kpis}>
          <View style={s.kpiMain}>
            <Text style={[s.label, { color: "#d2f0e0" }]}>Estimated total</Text>
            <Text style={[s.kpiValue, { color: "#ffffff", fontSize: 15 }]}>{naira(b.total)}</Text>
          </View>
          <View style={s.kpi}><Text style={s.label}>Materials</Text><Text style={s.kpiValue}>{naira(b.subtotal)}</Text></View>
          <View style={s.kpi}><Text style={s.label}>Contingency {CONTINGENCY_RATE * 100}%</Text><Text style={s.kpiValue}>{naira(b.contingency)}</Text></View>
          <View style={s.kpi}><Text style={s.label}>Line items</Text><Text style={s.kpiValue}>{b.itemCount}</Text></View>
        </View>

        {(b.unpricedCount > 0 || b.lowConfidenceCount > 0) && (
          <Text style={s.note}>
            {b.unpricedCount > 0 ? `${b.unpricedCount} item(s) marked "Ask vendor" have no listed price and are not in the total. ` : ""}
            {b.lowConfidenceCount > 0 ? `${b.lowConfidenceCount} quantity(ies) could not be measured clearly from the drawing and should be checked on site.` : ""}
          </Text>
        )}

        <Text style={s.h2}>Bill of materials</Text>
        <View style={s.th}>
          <Text style={s.cNo}>#</Text><Text style={s.cDesc}>Description</Text><Text style={s.cQty}>Qty</Text>
          <Text style={s.cUnit}>Unit</Text><Text style={s.cRate}>Rate (NGN)</Text><Text style={s.cAmt}>Amount (NGN)</Text>
        </View>
        {b.groups.map((g) => (
          <View key={g.category}>
            <View style={s.cat} wrap={false}>
              <Text style={s.catName}>{g.category}</Text>
              <Text style={{ fontWeight: 700, color: "#056449" }}>{naira(g.subtotal)}</Text>
            </View>
            {g.lines.map((l) => {
              n++;
              return (
                <View key={l.id} style={s.tr} wrap={false}>
                  <Text style={s.cNo}>{n}</Text>
                  <Text style={s.cDesc}>{l.description}</Text>
                  <Text style={s.cQty}>{formatQty(l.quantity)}</Text>
                  <Text style={s.cUnit}>{l.unit}</Text>
                  <Text style={s.cRate}>{l.unitPrice === null ? "Ask vendor" : naira(l.unitPrice, "")}</Text>
                  <Text style={s.cAmt}>{l.amount === null ? "-" : naira(l.amount, "")}</Text>
                </View>
              );
            })}
          </View>
        ))}

        <View style={s.totals} wrap={false}>
          <View style={s.totRow}><Text>Materials subtotal</Text><Text>{naira(b.subtotal)}</Text></View>
          <View style={s.totRow}><Text>Contingency ({CONTINGENCY_RATE * 100}%)</Text><Text>{naira(b.contingency)}</Text></View>
          <View style={s.grand}>
            <Text style={{ fontWeight: 700, fontSize: 11 }}>Estimated total</Text>
            <Text style={{ fontWeight: 700, fontSize: 11 }}>{naira(b.total)}</Text>
          </View>
        </View>

        <View break>
          <Text style={s.h2}>Vendors to call</Text>
          <Text style={{ color: MUTED, marginBottom: 8 }}>
            Nearest suppliers to {plan.city} for each category, best rated first. Quote reference {ref} when you call.
          </Text>
          {vendorsByCategory.map((c) => (
            <View key={c.category} wrap={false}>
              <View style={s.cat}><Text style={s.catName}>{c.category}</Text></View>
              {c.vendors.length === 0 && (
                <View style={s.vRow}><Text style={{ color: MUTED }}>No listed vendor nearby. Ask a general building materials dealer.</Text></View>
              )}
              {c.vendors.map((v) => (
                <View key={v.id} style={s.vRow}>
                  <View style={{ flex: 1 }}>
                    <Text style={{ fontWeight: 700 }}>{v.name}{v.verified ? "  (verified)" : ""}</Text>
                    <Text style={{ color: MUTED }}>{v.address.includes(v.city) ? v.address : `${v.address}, ${v.city}`}</Text>
                  </View>
                  <Text style={{ width: 90, color: MUTED }}>{TIER_LABEL[v.tier]}</Text>
                  <Text style={{ width: 50, color: MUTED }}>{v.rating.toFixed(1)} / 5</Text>
                  <Text style={{ width: 90, textAlign: "right", fontWeight: 700 }}>{displayPhone(v.phone)}</Text>
                </View>
              ))}
            </View>
          ))}

          {(plan.summary || plan.assumptions.length > 0) && (
            <View wrap={false}>
              <Text style={[s.h2, { marginTop: 16 }]}>Notes and assumptions</Text>
              {plan.summary ? <Text style={{ marginBottom: 6 }}>{plan.summary}</Text> : null}
              {plan.assumptions.map((a, i) => (
                <Text key={i} style={{ marginBottom: 3 }}>{i + 1}. {a}</Text>
              ))}
            </View>
          )}
          <Text style={{ color: MUTED, marginTop: 14, fontSize: 8 }}>
            Quantities were measured from the drawing by an AI model and checked against standard Nigerian building practice.
            Prices are from listed vendors on the date shown and exclude labour, transport and VAT unless stated by the vendor.
            Confirm quantities with your builder and prices with the vendor before paying.
          </Text>
        </View>

        <View style={s.footer} fixed>
          <Text>Konstruct material estimate, ref {ref}</Text>
          <Text render={({ pageNumber, totalPages }) => `Page ${pageNumber} of ${totalPages}`} />
        </View>
      </Page>
    </Document>
  );
}

export async function renderEstimatePdf(input: PdfInput): Promise<Buffer> {
  return renderToBuffer(<EstimateDocument {...input} />);
}
