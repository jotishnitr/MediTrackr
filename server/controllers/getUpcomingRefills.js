const Medicine = require("../models/Medicine");

// Helper to extract clean searchable medicine name (removes time indicators like "morning", "night", etc.)
const cleanMedicineNameForSearch = (rawName) => {
  if (!rawName || typeof rawName !== "string") return "";
  return rawName
    .replace(/\b(morning|night|afternoon|evening|daily|bedtime|before food|after food|tablet|tab|cap|capsule|syrup|drop|drops)\b/gi, "")
    .trim() || rawName.trim();
};

// Fetch products from myUpchar API if API key is provided
const fetchMyUpcharData = async (medicineName, medicineType) => {
  const apiKey = process.env.MYUPCHAR_API_KEY || process.env.MY_UPCHAR_API_KEY;
  if (!apiKey) return [];

  const cleanName = cleanMedicineNameForSearch(medicineName);
  if (!cleanName) return [];

  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 3500);

    let searchUrl = `https://beta.myupchar.com/api/medicine/search?api_key=${encodeURIComponent(apiKey)}&name=${encodeURIComponent(cleanName)}`;
    
    // If medicineType matches Allopath/Ayurveda/General/Homeopath/Unani, append it
    if (medicineType) {
      const typeLower = medicineType.toLowerCase();
      if (typeLower.includes("homeo")) searchUrl += `&type=Homeopath`;
      else if (typeLower.includes("ayur")) searchUrl += `&type=Ayurveda`;
      else if (typeLower.includes("unani")) searchUrl += `&type=Unani`;
      else if (typeLower.includes("allo")) searchUrl += `&type=Allopath`;
    }

    const response = await fetch(searchUrl, { signal: controller.signal });
    clearTimeout(timeoutId);

    if (!response.ok) return [];

    const data = await response.json();
    if (data && data.status === "OK" && Array.isArray(data.data)) {
      return data.data.map((item) => ({
        productId: item.product_id,
        name: item.name,
        form: item.form || "",
        manufacturer: item.manufacturer?.name || "",
        manufacturerUrl: item.manufacturer?.url || "",
        image: item.image || (item.images_hsh?.array && item.images_hsh.array[0]) || null,
        price: item.price ? {
          mrp: item.price.mrp,
          finalPrice: item.price.final_price,
          discountPerc: item.price.discount_perc,
        } : null,
        url: item.url || `https://www.myupchar.com/search?q=${encodeURIComponent(item.name || cleanName)}`,
        source: "myupchar"
      }));
    }
  } catch (err) {
    // Graceful fallback on network timeout or API error
    console.warn("myUpchar API search skipped/failed:", err.message);
  }

  return [];
};

// Generate standard trusted pharmacy buy links
const generatePharmacyBuyLinks = (medicineName) => {
  const cleanName = cleanMedicineNameForSearch(medicineName) || medicineName;
  const encodedName = encodeURIComponent(cleanName);

  return [
    {
      id: "1mg",
      name: "Tata 1mg",
      tagline: "Express Delivery & Lab Tests",
      url: `https://www.1mg.com/search/all?name=${encodedName}`,
      accentColor: "#ff6f61",
      badge: "Fast Delivery",
      icon: "local_shipping",
      trusted: true
    },
    {
      id: "apollo",
      name: "Apollo Pharmacy",
      tagline: "24/7 Delivery & 100% Genuine",
      url: `https://www.apollopharmacy.in/search-medicines/${encodedName}`,
      accentColor: "#00b2a9",
      badge: "24/7 Delivery",
      icon: "verified",
      trusted: true
    },
    {
      id: "pharmeasy",
      name: "PharmEasy",
      tagline: "Discounts & Cashback on Medicines",
      url: `https://pharmeasy.in/search/all?name=${encodedName}`,
      accentColor: "#10847e",
      badge: "Discounts",
      icon: "percent",
      trusted: true
    },
    {
      id: "netmeds",
      name: "Netmeds",
      tagline: "India Ki Pharmacy since 1914",
      url: `https://www.netmeds.com/catalogsearch/result?q=${encodedName}`,
      accentColor: "#24aeb1",
      badge: "Best Value",
      icon: "storefront",
      trusted: true
    },
    {
      id: "myupchar",
      name: "myUpchar Store",
      tagline: "Allopathy, Ayurveda & Homeopathy",
      url: `https://www.myupchar.com/search?q=${encodedName}`,
      accentColor: "#f27935",
      badge: "Ayurveda & Meds",
      icon: "medication",
      trusted: true
    },
    {
      id: "amazon",
      name: "Amazon Pharmacy",
      tagline: "Prime Fast Free Delivery",
      url: `https://www.amazon.in/s?k=${encodeURIComponent(cleanName + " medicine")}`,
      accentColor: "#ff9900",
      badge: "Prime Shipping",
      icon: "shopping_bag",
      trusted: true
    }
  ];
};

const getUpcomingRefills = async (req, res) => {
  try {
    const medicines = await Medicine.find({
      userId: req.user.id,
    });

    const upcomingRefills = [];

    // Process all medicines in parallel to fetch buy options concurrently
    const refillPromises = medicines.map(async (medicine) => {
      const count = typeof medicine.count === "number" ? medicine.count : (Number(medicine.count) || 0);
      const dosage = Number(medicine.dosage) > 0 ? Number(medicine.dosage) : 1;
      const remainingDays = Math.max(0, Math.floor(count / dosage));

      // Use actualName if provided, otherwise clean the reminder name
      const searchTargetName = (medicine.actualName && medicine.actualName.trim())
        ? medicine.actualName.trim()
        : (cleanMedicineNameForSearch(medicine.name) || medicine.name);

      // Fetch myUpchar API details (if configured) and generate verified buy options
      const [myUpcharResults] = await Promise.allSettled([
        fetchMyUpcharData(searchTargetName, medicine.type)
      ]);

      const myUpcharProducts = myUpcharResults.status === "fulfilled" ? myUpcharResults.value : [];
      const buyLinks = generatePharmacyBuyLinks(searchTargetName);

      const primaryBuyUrl = myUpcharProducts.length > 0 && myUpcharProducts[0].url
        ? myUpcharProducts[0].url
        : `https://www.1mg.com/search/all?name=${encodeURIComponent(searchTargetName)}`;

      return {
        id: medicine._id,
        _id: medicine._id,
        name: medicine.name,
        actualName: medicine.actualName || "",
        searchName: searchTargetName,
        type: medicine.type,
        dosage: medicine.dosage,
        unit: medicine.unit,
        time: medicine.time,
        count,
        remainingDays,
        buyOptions: {
          myUpcharProducts,
          buyLinks,
          primaryBuyUrl,
          totalOptions: myUpcharProducts.length + buyLinks.length
        }
      };
    });

    const results = await Promise.all(refillPromises);

    // Sort by refills needed earliest first
    results.sort((a, b) => a.remainingDays - b.remainingDays);

    res.status(200).json({
      success: true,
      upcomingRefills: results,
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: err.message,
    });
  }
};

module.exports = getUpcomingRefills;