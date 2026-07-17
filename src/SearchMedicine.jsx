import { useState, useEffect } from "react";
import { motion } from "framer-motion";

export default function SearchMedicine({ setCurrentPage, setShowAddMed }) {
  const [currentPopular, setCurrentPopular] = useState("");
  const [search, setSearch] = useState("");
  const [notFound, setNotFound] = useState(false);
  const [searchMed, setSearchMed] = useState("");
  const [searching, setSearching] = useState(false);
  const [searchTrigger, setSearchTrigger] = useState(0);

  const cleanUsage = (text) => {
    if (!text) return "No usage information available";

    let cleaned = text
      .replace(/indications and usage:?/gi, "")
      .replace(/uses:?/gi, "")
      .replace(/\s+/g, " ")
      .trim();

    // Keep only the first 2-3 sentences
    const sentences = cleaned.match(/[^.!?]+[.!?]+/g);

    if (sentences && sentences.length > 0) {
      return sentences.slice(0, 3).join(" ");
    }

    return cleaned.length > 250 ? cleaned.substring(0, 250) + "..." : cleaned;
  };

  const cleanWarning = (text) => {
    if (!text) return "No warnings available";

    return (
      text
        .replace(/warnings:?/gi, "")
        .replace(/warning:?/gi, "")
        .replace(/\s+/g, " ")
        .trim()
        .slice(0, 180) + (text.length > 180 ? "..." : "")
    );
  };

  const [medicines, setMedicines] = useState([
    {
      name: "Metformin HCl",
      subtitle: "METFORMIN HYDROCHLORIDE",
      route: "Oral",
      manufacturer: "Sun Pharma",
      description:
        "Used to improve blood sugar control in adults with Type 2 diabetes mellitus. Commonly prescribed alongside diet and exercise.",
      warning:
        "Use cautiously in patients with kidney disease. Seek medical advice if severe nausea, vomiting, or unusual fatigue occurs.",
    },

    {
      name: "Atorvastatin Calcium",
      subtitle: "ATORVASTATIN CALCIUM",
      route: "Oral",
      manufacturer: "Pfizer",
      description:
        "Used to lower cholesterol and reduce the risk of heart attack, stroke, and cardiovascular complications.",
      warning:
        "Avoid excessive alcohol consumption. Report unexplained muscle pain, tenderness, or weakness to a healthcare provider.",
    },

    {
      name: "Paracetamol",
      subtitle: "ACETAMINOPHEN",
      route: "Oral",
      manufacturer: "Cipla",
      description:
        "Provides relief from fever and mild to moderate pain such as headache, toothache, muscle pain, and common cold symptoms.",
      warning:
        "Do not exceed the recommended dosage. Excessive use may cause serious liver damage.",
    },

    {
      name: "Amoxicillin",
      subtitle: "AMOXICILLIN TRIHYDRATE",
      route: "Oral",
      manufacturer: "Mankind Pharma",
      description:
        "Antibiotic used to treat bacterial infections affecting the throat, ears, lungs, urinary tract, and skin.",
      warning:
        "Do not use if allergic to penicillin antibiotics. Complete the full prescribed course even if symptoms improve.",
    },

    {
      name: "Amlodipine",
      subtitle: "AMLODIPINE BESYLATE",
      route: "Oral",
      manufacturer: "Dr. Reddy's",
      description:
        "Helps control high blood pressure and chest pain by relaxing blood vessels and improving blood flow.",
      warning:
        "May cause dizziness or swelling of the ankles. Use caution when standing up quickly.",
    },

    {
      name: "Omeprazole",
      subtitle: "OMEPRAZOLE MAGNESIUM",
      route: "Oral",
      manufacturer: "Torrent Pharma",
      description:
        "Reduces stomach acid production and is commonly used for acid reflux, heartburn, and gastric ulcers.",
      warning:
        "Long-term use may increase the risk of vitamin B12 deficiency and bone fractures.",
    },

    {
      name: "Vitamin D3",
      subtitle: "CHOLECALCIFEROL",
      route: "Oral",
      manufacturer: "Abbott",
      description:
        "Supports bone health, calcium absorption, immune function, and treatment of vitamin D deficiency.",
      warning:
        "Avoid excessive intake. High doses may lead to elevated calcium levels and kidney complications.",
    },

    {
      name: "Aspirin",
      subtitle: "ACETYLSALICYLIC ACID",
      route: "Oral",
      manufacturer: "Bayer",
      description:
        "Used as a pain reliever and blood thinner to reduce the risk of heart attack and stroke in certain patients.",
      warning:
        "May increase the risk of stomach bleeding. Consult a doctor before use with blood-thinning medications.",
    },

    {
      name: "Levothyroxine",
      subtitle: "LEVOTHYROXINE SODIUM",
      route: "Oral",
      manufacturer: "AbbVie",
      description:
        "Replacement therapy for hypothyroidism and other thyroid hormone deficiency disorders.",
      warning:
        "Take on an empty stomach. Avoid taking calcium or iron supplements within several hours of the dose.",
    },

    {
      name: "Cetirizine",
      subtitle: "CETIRIZINE HYDROCHLORIDE",
      route: "Oral",
      manufacturer: "GSK",
      description:
        "Provides relief from allergy symptoms such as sneezing, runny nose, watery eyes, and itching.",
      warning:
        "May cause drowsiness in some individuals. Avoid driving or operating machinery if affected.",
    },

    {
      name: "Losartan",
      subtitle: "LOSARTAN POTASSIUM",
      route: "Oral",
      manufacturer: "Lupin",
      description:
        "Treats high blood pressure and helps protect kidney function in people with diabetes.",
      warning:
        "Monitor potassium levels regularly. Not recommended during pregnancy.",
    },

    {
      name: "Insulin Glargine",
      subtitle: "INSULIN GLARGINE",
      route: "Injection",
      manufacturer: "Sanofi",
      description:
        "Long-acting insulin used to control blood sugar levels in patients with Type 1 and Type 2 diabetes.",
      warning:
        "Low blood sugar may occur. Always monitor glucose levels and keep a fast-acting sugar source available.",
    },
  ]);

  useEffect(() => {
    let timer;
    async function fetchMedicine() {
      setSearching(true);
      const query = encodeURIComponent(searchMed.trim());
      try {
        const response = await fetch(
          `http://localhost:5000/searchMed/api?query=${query}`,
        );
        const data = await response.json();

        if (!response.ok) {
          setNotFound(true);
          setSearching(false);
          return;
        }
        setNotFound(false);
        setMedicines([
          {
            name: data.name,

            subtitle: data.genericName,

            route: data.route,

            manufacturer: data.manufacturer,

            description: cleanUsage(data.usage),

            warning: cleanWarning(data.warning),
          },
        ]);
        setSearching(false);
      } catch (error) {
        console.error(error);
        setNotFound(true);
        setSearching(false);
      }
    }

    if (searchMed.trim()) {
      fetchMedicine();
    } else {
      timer = setTimeout(() => {
        if (searching) setSearching(false);
        if (notFound) setNotFound(false);
      }, 0);
    }

    return () => {
      if (timer) clearTimeout(timer);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchMed, searchTrigger]);

  return (
    <motion.section
      className="searchMedicine"
      initial={{ opacity: 0, y: 20, scale: 0.98, filter: "blur(8px)" }}
      animate={{ opacity: 1, y: 0, scale: 1, filter: "blur(0px)" }}
      exit={{ opacity: 0, y: -20, scale: 0.98, filter: "blur(8px)" }}
      transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
    >
      <div className="search-header">
        <div className="dashboard-header-left">
          <h1>Search Medicine</h1>
          <p>Discover medicines and treatment options</p>
        </div>

        <button className="add-med-btn">+ Add Medicine</button>
      </div>

      <div className={`search-box ${searching ? "searching" : ""}`}>
        <span className="material-symbols-outlined">
          <img src="search.png"></img>
        </span>

        <input
          type="text"
          placeholder="Search by medicine name, generic name..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />

        <button
          disabled={searching}
          onClick={() => {
            setSearchMed(search);
            setSearching(true);
            setSearchTrigger((prev) => prev + 1);
          }}
        >
          {searching ? (
            <div className="search-loader">
              <span className="search-spinner"></span>
              <span>Searching</span>
            </div>
          ) : (
            "Search"
          )}
        </button>
      </div>

      <h3 className="section-title">POPULAR SEARCHES</h3>

      <div className="category-row">
        <button
          className={currentPopular === "Metformin" ? "active" : ""}
          onClick={() => {
            setCurrentPopular("Metformin");
            setSearch("metformin");
          }}
        >
          Metformin
        </button>
        <button
          className={currentPopular === "Atorvastatin" ? "active" : ""}
          onClick={() => {
            setCurrentPopular("Atorvastatin");
            setSearch("atorvastatin");
          }}
        >
          Atorvastatin
        </button>
        <button
          className={currentPopular === "Omeprazole" ? "active" : ""}
          onClick={() => {
            setCurrentPopular("Omeprazole");
            setSearch("omeprazole");
          }}
        >
          Omeprazole
        </button>
        <button
          className={currentPopular === "Amoxicillin" ? "active" : ""}
          onClick={() => {
            setCurrentPopular("Amoxicillin");
            setSearch("amoxicillin");
          }}
        >
          Amoxicillin
        </button>
        <button
          className={currentPopular === "Amlodipine" ? "active" : ""}
          onClick={() => {
            setCurrentPopular("Amlodipine");
            setSearch("amlodipine");
          }}
        >
          Amlodipine
        </button>
        <button
          className={currentPopular === "VitaminD" ? "active" : ""}
          onClick={() => {
            setCurrentPopular("VitaminD");
            setSearch("cholecalciferol");
          }}
        >
          Vitamin D
        </button>
        <button
          className={currentPopular === "Aspirin" ? "active" : ""}
          onClick={() => {
            setCurrentPopular("Aspirin");
            setSearch("aspirin");
          }}
        >
          Aspirin
        </button>
        <button
          className={currentPopular === "Lisinopril" ? "active" : ""}
          onClick={() => {
            setCurrentPopular("Lisinopril");
            setSearch("lisinopril");
          }}
        >
          Lisinopril
        </button>

        <button
          className={currentPopular === "Losartan" ? "active" : ""}
          onClick={() => {
            setCurrentPopular("Losartan");
            setSearch("losartan");
          }}
        >
          Losartan
        </button>
      </div>

      <h3 className="results-title">
        {searching === true ? "POPULAR MEDICINES" : "SEARCH RESULTS"}
      </h3>

      <p className="results-subtitle">
        Browse verified medicine information and treatment details
      </p>

      <div className="medicine-grid">
        {searching ? (
          Array.from({ length: 3 }).map((_, index) => (
            <div key={index} className="medicine-info-card skeleton-card">
              <div className="medicine-card-header">
                <div className="medicine-icon skeleton-element skeleton-icon"></div>
                <div className="label-badge skeleton-element skeleton-badge"></div>
              </div>
              <div className="medicine-title skeleton-element skeleton-title"></div>
              <div className="generic-name skeleton-element skeleton-subtitle"></div>
              <div className="medicine-meta">
                <div className="meta-box skeleton-element skeleton-meta"></div>
                <div className="meta-box skeleton-element skeleton-meta"></div>
              </div>
              <div className="usage-preview skeleton-element skeleton-usage"></div>
              <div className="warning-preview skeleton-element skeleton-warning"></div>
              <div className="card-footer">
                <div className="details-btn skeleton-element skeleton-button"></div>
              </div>
            </div>
          ))
        ) : notFound === true ? (
          <h2 className="no-medicine-found">
            No exact medicine found. Try searching with a generic name or a
            different medicine name.
          </h2>
        ) : (
          medicines.map((med, index) => (
            <div key={index} className="medicine-info-card">
              <div className="medicine-card-header">
                <div className={`medicine-icon ${med.color}`}>
                  <img
                    className="fda-icon"
                    alt="FDA Verified"
                    src="fda.png"
                  ></img>
                </div>

                <span className="label-badge">Verified</span>
              </div>

              <h2 className="medicine-title">{med.name}</h2>

              <p className="generic-name">{med.subtitle}</p>

              <div className="medicine-meta">
                <div className="meta-box">
                  <span className="meta-label">Route</span>

                  <span className="meta-value">{med.route}</span>
                </div>

                <div className="meta-box">
                  <span className="meta-label">Manufacturer</span>

                  <span className="meta-value">{med.manufacturer}</span>
                </div>
              </div>

              <div className="usage-preview">
                <h4>Usage</h4>

                <p>{med.description}</p>
              </div>

              <div className="warning-preview">
                <h4>Warnings</h4>

                <p>{med.warning}</p>
              </div>

              <div className="card-footer">
                <button
                  className="details-btn"
                  onClick={() => {
                    setCurrentPage("Dashboard");
                    setShowAddMed(true);
                  }}
                >
                  Add to List
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </motion.section>
  );
}
