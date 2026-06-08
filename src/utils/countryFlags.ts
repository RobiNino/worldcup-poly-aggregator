const COUNTRY_CODES: Record<string, string> = {
  "algeria": "DZ",
  "argentina": "AR",
  "australia": "AU",
  "austria": "AT",
  "belgium": "BE",
  "bosnia & herzegovina": "BA",
  "brazil": "BR",
  "canada": "CA",
  "cape verde": "CV",
  "colombia": "CO",
  "croatia": "HR",
  "curaçao": "CW",
  "czech republic": "CZ",
  "dr congo": "CD",
  "ecuador": "EC",
  "egypt": "EG",
  "england": "GB-ENG",
  "france": "FR",
  "germany": "DE",
  "ghana": "GH",
  "haiti": "HT",
  "indonesia": "ID",
  "iran": "IR",
  "iraq": "IQ",
  "ireland": "IE",
  "italy": "IT",
  "ivory coast": "CI",
  "jamaica": "JM",
  "japan": "JP",
  "jordan": "JO",
  "kenya": "KE",
  "mexico": "MX",
  "morocco": "MA",
  "netherlands": "NL",
  "new zealand": "NZ",
  "norway": "NO",
  "panama": "PA",
  "paraguay": "PY",
  "portugal": "PT",
  "qatar": "QA",
  "saudi arabia": "SA",
  "scotland": "GB-SCT",
  "senegal": "SN",
  "south africa": "ZA",
  "south korea": "KR",
  "spain": "ES",
  "sweden": "SE",
  "switzerland": "CH",
  "tunisia": "TN",
  "turkey": "TR",
  "usa": "US",
  "uruguay": "UY",
  "uzbekistan": "UZ",
};

function codeToFlag(code: string): string {
  const base = code.slice(0, 2).toUpperCase();
  return [...base]
    .map((c) => String.fromCodePoint(0x1f1e6 + c.charCodeAt(0) - 65))
    .join("");
}

export function getFlag(teamName: string): string {
  const code = COUNTRY_CODES[teamName.toLowerCase()];
  if (!code) return "";
  return codeToFlag(code);
}
