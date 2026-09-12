const searchMedicineDetails = async (query) => {
  if (!query || typeof query !== "string") {
    return null;
  }

  const cleanQuery = query.trim();
  if (!cleanQuery) return null;

  // 1. Query the openFDA API using openfda.generic_name and openfda.brand_name
  try {
    const fdaUrl = `https://api.fda.gov/drug/label.json?search=openfda.generic_name:"${encodeURIComponent(cleanQuery)}"+openfda.brand_name:"${encodeURIComponent(cleanQuery)}"&limit=1`;
    const fdaResponse = await fetch(fdaUrl);

    if (fdaResponse.ok) {
      const fdaData = await fdaResponse.json();
      if (fdaData && fdaData.results && fdaData.results.length > 0) {
        const item = fdaData.results[0];

        // Format and map directly to MediTrackr UI schema
        const genericName =
          item.openfda?.generic_name?.[0] ||
          item.openfda?.brand_name?.[0] ||
          cleanQuery;
        const brandName = item.openfda?.brand_name?.[0] || genericName;
        const manufacturer =
          item.openfda?.manufacturer_name?.[0] || "Unknown Manufacturer";
        const route =
          item.openfda?.route?.join(", ") ||
          item.route?.join(", ") ||
          item.openfda?.route?.[0] ||
          "ORAL";
        const usage =
          item.indications_and_usage?.[0] || item.purpose?.[0] || "";
        const warnings =
          item.warnings?.[0] || item.boxed_warning?.[0] || "";

        return {
          name: brandName,
          genericName,
          manufacturer,
          route,
          usage,
          warning: warnings,
          source: "fda",
        };
      }
    }
  } catch (fdaError) {
    console.warn("openFDA API failed, attempting DailyMed fallback:", fdaError.message);
  }

  // 2. Fallback to DailyMed API
  try {
    const dmUrl = `https://dailymed.nlm.nih.gov/dailymed/services/v2/spls.json?drug_name=${encodeURIComponent(cleanQuery)}&pagesize=1`;
    const dmResponse = await fetch(dmUrl);

    if (dmResponse.ok) {
      const dmData = await dmResponse.json();
      if (dmData && dmData.data && dmData.data.length > 0) {
        const spl = dmData.data[0];
        const setId = spl.setid;
        let title = spl.title || cleanQuery;

        let genericName = cleanQuery;
        let brandName = title;
        let manufacturer = "Unknown Manufacturer";
        let route = "ORAL";

        const matchTitle = title.match(/^(.*?)\s*\[(.*?)\]$/);
        if (matchTitle) {
          brandName = matchTitle[1].trim();
          manufacturer = matchTitle[2].trim();
        }

        try {
          const pkgResponse = await fetch(
            `https://dailymed.nlm.nih.gov/dailymed/services/v2/spls/${setId}/packaging.json`
          );
          if (pkgResponse.ok) {
            const pkgData = await pkgResponse.json();
            const product = pkgData.data?.products?.[0];
            if (product) {
              if (product.product_name) brandName = product.product_name;
              if (product.product_name_generic)
                genericName = product.product_name_generic;
              else if (product.active_ingredients?.[0]?.name) {
                genericName = product.active_ingredients[0].name;
              }
            }
          }
        } catch (pkgError) {
          console.warn("DailyMed packaging lookup failed:", pkgError.message);
        }

        return {
          name: brandName,
          genericName: genericName.toUpperCase(),
          manufacturer,
          route,
          usage: `Indications & clinical use details sourced from DailyMed for ${brandName}.`,
          warning: `Consult package insert and healthcare provider for complete warnings, dosing, and precautions.`,
          source: "dailymed",
        };
      }
    }
  } catch (dmError) {
    console.warn("DailyMed API failed, attempting DrugBank fallback:", dmError.message);
  }

  // 3. Fallback to DrugBank API (https://api.drugbank.com/v1/drug_names?q=)
  try {
    const headers = {};
    if (process.env.DRUGBANK_API_KEY) {
      headers["Authorization"] = process.env.DRUGBANK_API_KEY;
    }

    const dbUrl = `https://api.drugbank.com/v1/drug_names?q=${encodeURIComponent(cleanQuery)}&region=us`;
    const dbResponse = await fetch(dbUrl, { headers });

    if (dbResponse.ok) {
      const dbData = await dbResponse.json();
      const items = Array.isArray(dbData)
        ? dbData
        : dbData.products || dbData.data || dbData.results || [];

      if (items.length > 0) {
        const item = items[0];
        const brandName = item.name || item.product_name || cleanQuery;
        const genericName =
          item.ingredient_name || item.generic_name || item.name || cleanQuery;
        const manufacturer =
          item.products?.[0]?.labeller ||
          item.labeller ||
          item.manufacturer ||
          "Unknown Manufacturer";
        const route = item.products?.[0]?.route || item.route || "ORAL";

        return {
          name: brandName,
          genericName: (genericName || "").toUpperCase(),
          manufacturer,
          route,
          usage: `Indications & pharmacology details sourced from DrugBank database for ${brandName}.`,
          warning: `Consult medical references and healthcare professional for usage, warnings, and drug interactions.`,
          source: "drugbank",
        };
      }
    }
  } catch (dbError) {
    console.warn("DrugBank API failed:", dbError.message);
  }

  return null;
};

const fetchFDA = async (req, res) => {
  try {
    const { query } = req.query;

    if (!query) {
      return res.status(400).json({
        message: "Query parameter is required",
      });
    }

    const medicineData = await searchMedicineDetails(query);

    if (!medicineData) {
      return res.status(404).json({
        message: "Medicine not found",
      });
    }

    res.status(200).json(medicineData);
  } catch (err) {
    res.status(500).json({
      message: err.message || "Internal server error",
    });
  }
};

module.exports = fetchFDA;
module.exports.searchMedicineDetails = searchMedicineDetails;
