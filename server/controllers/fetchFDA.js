const fetchFDA = async (req, res) => {
  try {
    const { query } = req.query;

    const result = await fetch(
      `https://api.fda.gov/drug/label.json?search=(openfda.brand_name:"${query}"+OR+openfda.generic_name:"${query}")&limit=10`,
    );

    const data = await result.json();

    if (!data.results || data.results.length === 0) {
      return res.status(404).json({
        message: "Medicine not found",
      });
    }

    const medicine = data.results[0];

    res.status(200).json({
      name: medicine.openfda?.brand_name?.[0] ?? "Unknown",
      genericName: medicine.openfda?.generic_name?.[0] ?? "Unknown",
      manufacturer: medicine.openfda?.manufacturer_name?.[0] ?? "Unknown",
      route:
        medicine.openfda?.route?.join(", ") ||
        medicine.route?.join(", ") ||
        "Not Available",
      usage: medicine.indications_and_usage?.[0] ?? "",
      warning: medicine.warnings?.[0] ?? "",
    });
  } catch (err) {
    res.status(500).json({
      message: err.message,
    });
  }
};

module.exports = fetchFDA;
