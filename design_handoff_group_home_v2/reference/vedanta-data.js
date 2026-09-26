/* Vedanta Group shared content — edit here, both company sites update.
   Source: content/clients/*.json + Vedanta Group Brochure 2026 p.4 (via design_handoff_clients_projects).
   company: [] = client appears in the GROUP clientele list; which company supplied it is NOT yet confirmed.
   verified: company slugs backed by a published project record (never inferred from vendor/consultant links).
   industry: proposed classification of the client's own sector — confirm with management. */
(function () {
  const C = (slug, name, logo, industry, extra) => Object.assign({ slug, name, logo: logo ? 'assets/clients/' + logo + '.png' : '', industry, company: [], verified: [], projectRefs: [], consent: 'granted', logoStatus: 'brochure-crop' }, extra || {});
  const shared = { logoStatus: 'shared-crop' };
  window.VEDANTA_DATA = {
    industries: ['Oil, gas & refining', 'Power & nuclear', 'Steel', 'Fertilizer & chemicals', 'Cement', 'City gas distribution', 'Equipment OEMs', 'EPC & engineering'],
    clients: [
      C('andritz', 'ANDRITZ', 'c01', 'Equipment OEMs'),
      C('fdh-jv', 'FDH JV (Fluor · Daewoo E&C · Hyundai)', 'c02', 'EPC & engineering'),
      C('ingersoll-rand', 'Ingersoll Rand', 'c03', 'Equipment OEMs'),
      C('voith', 'Voith', 'c04', 'Equipment OEMs'),
      C('emerson', 'Emerson Process Management', 'c05', 'Equipment OEMs', { company: ['dhruv-epc'], verified: ['dhruv-epc'], projectRefs: ['dhruv-epc-02', 'dhruv-epc-03'] }),
      C('siemens-dresser-rand', 'Siemens Dresser-Rand', 'c06', 'Equipment OEMs'),
      C('knpc', 'KNPC', 'c07', 'Oil, gas & refining'),
      C('man-es', 'MAN Energy Solutions', 'c08', 'Equipment OEMs'),
      C('abc-compressors', 'ABC Compressors', 'c09', 'Equipment OEMs'),
      C('wartsila', 'Wärtsilä', 'c10', 'Equipment OEMs'),
      C('thyssenkrupp', 'thyssenkrupp', 'c11', 'EPC & engineering'),
      C('linde', 'Linde', 'c12', 'EPC & engineering'),
      C('forbes-marshall', 'Forbes Marshall', 'c13', 'Equipment OEMs'),
      C('amns', 'AM/NS India', 'c14', 'Steel'),
      C('lt-he', 'L&T Hydrocarbon Engineering', 'c15', 'EPC & engineering'),
      C('ntpc', 'NTPC', 'c16', 'Power & nuclear'),
      C('reliance', 'Reliance Industries', 'c17', 'Oil, gas & refining'),
      C('barc', 'BARC', 'c18', 'Power & nuclear'),
      C('npcil', 'NPCIL', 'c19', 'Power & nuclear'),
      C('eil', 'Engineers India Limited', 'c20', 'EPC & engineering'),
      C('thermax', 'Thermax', 'c21', 'Equipment OEMs'),
      C('nayara', 'Nayara Energy', 'c22', 'Oil, gas & refining'),
      C('bpcl', 'Bharat Petroleum', 'c23', 'Oil, gas & refining'),
      C('mrpl', 'MRPL', 'c24', 'Oil, gas & refining', shared),
      C('ongc', 'ONGC', 'c24', 'Oil, gas & refining', shared),
      C('indianoil', 'IndianOil', 'c25', 'Oil, gas & refining'),
      C('bhel', 'BHEL', 'c26', 'Equipment OEMs'),
      C('tata-steel', 'Tata Steel', 'c27', 'Steel'),
      C('jsw-steel', 'JSW Steel', 'c28', 'Steel'),
      C('isgec', 'ISGEC Heavy Engineering', 'c29', 'EPC & engineering'),
      C('grasim', 'Aditya Birla Grasim', 'c30', 'Fertilizer & chemicals'),
      C('gsfc', 'Gujarat State Fertilizers & Chemicals', 'c31', 'Fertilizer & chemicals'),
      C('ultratech', 'UltraTech Cement', 'c32', 'Cement'),
      C('praj', 'Praj Industries', 'c33', 'EPC & engineering'),
      C('sail', 'SAIL', 'c34', 'Steel'),
      C('vizag-steel', 'Vizag Steel', 'c35', 'Steel'),
      C('torrent-gas', 'Torrent Gas', 'c36', 'City gas distribution'),
      C('swcogen', 'SWCOGEN', 'c37', 'Power & nuclear', shared),
      C('cem-engineering', 'CEM Engineering', 'c37', 'EPC & engineering', shared),
      C('gujarat-gas', 'Gujarat Gas', 'c38', 'City gas distribution'),
      C('nfl', 'National Fertilizers Limited', 'c39', 'Fertilizer & chemicals'),
      C('sagar-cement', 'Sagar Cement', 'c40', 'Cement'),
      C('hurl', 'HURL', 'c41', 'Fertilizer & chemicals'),
      C('sterling-wilson', 'Sterling & Wilson', 'c42', 'EPC & engineering'),
    ],
    homeClients: ['reliance', 'indianoil', 'bpcl', 'ntpc', 'npcil', 'eil', 'emerson', 'siemens-dresser-rand', 'tata-steel', 'jsw-steel', 'thermax', 'linde', 'lt-he', 'andritz'],
    /* Group-level list from the brochure. kind (TPI vs approved-vendor) must be classified by management before publish. */
    groupApprovals: [
      ["Lloyd's Register", 'a1'], ['Engineers India Limited', 'a2'], ['Bureau Veritas', 'a3'], ['TÜV NORD', 'a4'], ['SGS', 'a5'], ['MECON', 'a6'],
      ['PDIL', 'a7'], ['DNV·GL', 'a8'], ['TÜV Rheinland', 'a9'], ['Tata Projects', 'a10'], ['WAPCOS', 'a11'], ['CEI', 'a12'],
    ].map(([name, id]) => ({ name, logo: 'assets/approvals/' + id + '.png', kind: 'pending' })),
    /* RFQ integration contract — matches packages/schemas/src/rfq.ts (RFQSubmission) and apps/web/app/api/rfq/route.ts */
    rfqEndpoint: '/api/rfq',
  };
})();
