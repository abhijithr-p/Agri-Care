// Database of crops and their ideal growth conditions
const CROP_DATABASE = [
  {
    name: "Rice (Paddy)",
    topography: ["plain", "terrace"],
    soilTypes: ["clay", "loamy", "alluvial"],
    waterReq: "high",
    seasons: ["kharif"],
    idealTemp: "20°C - 35°C",
    duration: "120 - 150 days",
    description: "High yield in water-retentive clay or loamy soils on flat or terrace land."
  },
  {
    name: "Wheat",
    topography: ["plain"],
    soilTypes: ["loamy", "clay", "black"],
    waterReq: "moderate",
    seasons: ["rabi"],
    idealTemp: "10°C - 25°C",
    duration: "110 - 130 days",
    description: "Best grown in cooler seasons with well-drained loamy or clay-loam soils."
  },
  {
    name: "Cotton",
    topography: ["plain"],
    soilTypes: ["black", "loamy"],
    waterReq: "moderate",
    seasons: ["kharif"],
    idealTemp: "21°C - 30°C",
    duration: "150 - 180 days",
    description: "Thrives in deep black cotton soil with good water retention and warm climate."
  },
  {
    name: "Tea / Coffee",
    topography: ["hilly", "terrace"],
    soilTypes: ["loamy", "red"],
    waterReq: "high",
    seasons: ["kharif", "rabi"],
    idealTemp: "15°C - 28°C",
    duration: "Perennial",
    description: "Requires well-drained acidic soil on sloped hilly terrains with heavy rainfall."
  },
  {
    name: "Millets (Ragi/Jowar/Bajra)",
    topography: ["plain", "hilly", "terrace"],
    soilTypes: ["red", "sandy", "loamy", "black"],
    waterReq: "low",
    seasons: ["kharif", "zaid"],
    idealTemp: "25°C - 35°C",
    duration: "90 - 120 days",
    description: "Hardy crop ideal for drylands, low rainfall, and sandy or red soils."
  },
  {
    name: "Groundnut (Peanut)",
    topography: ["plain"],
    soilTypes: ["sandy", "loamy", "red"],
    waterReq: "low",
    seasons: ["kharif"],
    idealTemp: "22°C - 30°C",
    duration: "100 - 120 days",
    description: "Requires light, well-drained sandy loam or red soil to allow pod expansion."
  }
];

export function getCropRecommendations({ topography, soilType, waterAvailability, season }) {
  const matches = CROP_DATABASE.map(crop => {
    let score = 0;

    // Evaluate Topography match
    if (crop.topography.includes(topography)) score += 30;

    // Evaluate Soil match
    if (crop.soilTypes.includes(soilType)) score += 30;

    // Evaluate Water availability match
    if (crop.waterReq === waterAvailability) score += 25;

    // Evaluate Season match
    if (crop.seasons.includes(season)) score += 15;

    return { ...crop, matchPercentage: score };
  });

  // Filter out non-matching crops and sort by highest suitability
  return matches
    .filter(crop => crop.matchPercentage >= 50)
    .sort((a, b) => b.matchPercentage - a.matchPercentage);
}