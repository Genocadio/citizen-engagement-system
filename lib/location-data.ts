// Rwanda administrative divisions data

export const countries = [
  "Rwanda",
  "Burundi",
  "Democratic Republic of Congo",
  "Kenya",
  "Tanzania",
  "Uganda",
  "United States",
  "United Kingdom",
  "Canada",
  "Other",
]

// Rwanda provinces
export const rwandaProvinces = [
  "Kigali City",
  "Northern Province",
  "Southern Province",
  "Eastern Province",
  "Western Province",
]

// Districts by province
export const rwandaDistricts: Record<string, string[]> = {
  "Kigali City": ["Gasabo", "Kicukiro", "Nyarugenge"],
  "Northern Province": ["Burera", "Gakenke", "Gicumbi", "Musanze", "Rulindo"],
  "Southern Province": ["Gisagara", "Huye", "Kamonyi", "Muhanga", "Nyamagabe", "Nyanza", "Nyaruguru", "Ruhango"],
  "Eastern Province": ["Bugesera", "Gatsibo", "Kayonza", "Kirehe", "Ngoma", "Nyagatare", "Rwamagana"],
  "Western Province": ["Karongi", "Ngororero", "Nyabihu", "Nyamasheke", "Rubavu", "Rutsiro", "Rusizi"],
}

// Sectors by district
export const rwandaSectors: Record<string, string[]> = {
  // Kigali City
  Gasabo: [
    "Bumbogo",
    "Gatsata",
    "Gikomero",
    "Gisozi",
    "Jabana",
    "Jali",
    "Kacyiru",
    "Kimihurura",
    "Kimironko",
    "Kinyinya",
    "Ndera",
    "Nduba",
    "Remera",
    "Rusororo",
    "Rutunga",
  ],
  Kicukiro: [
    "Gahanga",
    "Gatenga",
    "Gikondo",
    "Kagarama",
    "Kanombe",
    "Kicukiro",
    "Kigarama",
    "Masaka",
    "Niboye",
    "Nyarugunga",
  ],
  Nyarugenge: [
    "Gitega",
    "Kanyinya",
    "Kigali",
    "Kimisagara",
    "Mageragere",
    "Muhima",
    "Nyakabanda",
    "Nyamirambo",
    "Nyarugenge",
    "Rwezamenyo",
  ],

  // Northern Province - Sample sectors for key districts
  Musanze: ["Busogo", "Cyuve", "Gacaca", "Gataraga", "Kimonyi", "Kinigi", "Muhoza", "Muko", "Musanze", "Nkotsi"],
  Burera: ["Butaro", "Cyanika", "Gahunga", "Gitovu", "Kagogo", "Kinoni", "Kinyababa", "Kivuye", "Nemba", "Rugarama"],

  // Southern Province - Sample sectors for key districts
  Huye: ["Gishamvu", "Karama", "Kigoma", "Maraba", "Mbazi", "Mukura", "Ngoma", "Ruhashya", "Rusatira", "Simbi"],
  Nyamagabe: ["Buruhukiro", "Cyanika", "Gasaka", "Gatare", "Kaduha", "Kamegeri", "Kibirizi", "Mugano", "Musange"],

  // Eastern Province - Sample sectors for key districts
  Kayonza: [
    "Gahini",
    "Kabare",
    "Kabarondo",
    "Mukarange",
    "Murama",
    "Murundi",
    "Mwiri",
    "Ndego",
    "Nyamirama",
    "Rwinkwavu",
  ],
  Ngoma: ["Gashanda", "Jarama", "Karembo", "Kazo", "Kibungo", "Mugesera", "Murama", "Mutenderi", "Remera", "Rukira"],

  // Western Province - Sample sectors for key districts
  Rubavu: [
    "Bugeshi",
    "Busasamana",
    "Cyanzarwe",
    "Gisenyi",
    "Kanama",
    "Kanzenze",
    "Mudende",
    "Nyakiliba",
    "Nyamyumba",
    "Rubavu",
  ],
  Karongi: [
    "Bwishyura",
    "Gashari",
    "Gishyita",
    "Gitesi",
    "Mubuga",
    "Murambi",
    "Murundi",
    "Mutuntu",
    "Rubengera",
    "Rugabano",
  ],
}

// Helper function to get districts based on province
export function getDistrictsByProvince(province: string): string[] {
  return rwandaDistricts[province] || []
}

// Helper function to get sectors based on district
export function getSectorsByDistrict(district: string): string[] {
  return rwandaSectors[district] || []
}
