import { useState } from "react";

export default function ProfileModal({ profileDetails, setProfileDetails, onClose }) {
  // Check if we need to show the input form first (e.g. if fields like Age, Blood Type are unset)
  const [isEditing, setIsEditing] = useState(() => {
    return !profileDetails.age || !profileDetails.bloodType;
  });

  const [formData, setFormData] = useState({
    name: profileDetails.name || "",
    age: profileDetails.age || "",
    bloodType: profileDetails.bloodType || "",
    height: profileDetails.height || "",
    weight: profileDetails.weight || "",
    allergies: profileDetails.allergies || "",
    emergencyContact: profileDetails.emergencyContact || "",
    email: profileDetails.email || ""
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSave = (e) => {
    e.preventDefault();
    if (!formData.name.trim()) {
      alert("Please enter at least a name.");
      return;
    }
    
    // Save to parent state
    setProfileDetails(formData);
    
    // Sync weight back to health vitals if weight was updated
    if (formData.weight) {
      localStorage.setItem("weight", formData.weight);
      // Dispatch storage event to notify other components if necessary
      window.dispatchEvent(new Event("storage"));
    }

    // Sync to backend addHealthProfile
    fetch("http://localhost:5000/addHealthProfile", {
      method: "POST",
      credentials: "include",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        fullName: formData.name,
        age: formData.age ? Number(formData.age) : undefined,
        bloodType: formData.bloodType,
        height: formData.height ? Number(formData.height) : undefined,
        weight: formData.weight ? Number(formData.weight) : undefined,
        allergies: formData.allergies,
        emergencyContact: formData.emergencyContact,
      }),
    })
      .then((res) => res.json())
      .then((data) => {
        if (data.success && data.profile) {
          const profile = data.profile;
          const updatedDetails = {
            name: profile.fullName || "",
            age: profile.age || "",
            bloodType: profile.bloodType || "",
            height: profile.height || "",
            weight: profile.weight || "",
            allergies: profile.allergies || "",
            emergencyContact: profile.emergencyContact || "",
            email: formData.email, // preserve email
          };
          setProfileDetails(updatedDetails);
        }
      })
      .catch((err) => console.error("Error saving health profile to backend:", err));

    setIsEditing(false);
  };

  return (
    <div className="profile-modal-overlay">
      <div className="profile-modal">
        <div className="profile-modal-header">
          <h2>{isEditing ? "Edit Health Profile" : "Health Profile"}</h2>
          <button className="profile-close-btn" onClick={onClose}>✕</button>
        </div>

        <div className="profile-modal-body">
          {isEditing ? (
            <form onSubmit={handleSave} className="profile-form">
              <div className="profile-form-group">
                <label>Email Address</label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  readOnly
                  disabled
                  style={{ opacity: 0.6, cursor: "not-allowed", background: "rgba(255, 255, 255, 0.05)" }}
                />
              </div>

              <div className="profile-form-group">
                <label>Full Name</label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  placeholder="e.g. Jotish Kumar"
                  required
                />
              </div>

              <div className="profile-form-row">
                <div className="profile-form-group">
                  <label>Age</label>
                  <input
                    type="number"
                    name="age"
                    value={formData.age}
                    onChange={handleChange}
                    placeholder="e.g. 28"
                  />
                </div>

                <div className="profile-form-group">
                  <label>Blood Type</label>
                  <select
                    name="bloodType"
                    value={formData.bloodType}
                    onChange={handleChange}
                  >
                    <option value="">Select...</option>
                    <option value="O+">O+</option>
                    <option value="O-">O-</option>
                    <option value="A+">A+</option>
                    <option value="A-">A-</option>
                    <option value="B+">B+</option>
                    <option value="B-">B-</option>
                    <option value="AB+">AB+</option>
                    <option value="AB-">AB-</option>
                  </select>
                </div>
              </div>

              <div className="profile-form-row">
                <div className="profile-form-group">
                  <label>Height (cm)</label>
                  <input
                    type="number"
                    name="height"
                    value={formData.height}
                    onChange={handleChange}
                    placeholder="e.g. 175"
                  />
                </div>

                <div className="profile-form-group">
                  <label>Weight (kg)</label>
                  <input
                    type="number"
                    step="0.1"
                    name="weight"
                    value={formData.weight}
                    onChange={handleChange}
                    placeholder="e.g. 70.5"
                  />
                </div>
              </div>

              <div className="profile-form-group">
                <label>Allergies & Chronic Conditions</label>
                <textarea
                  name="allergies"
                  value={formData.allergies}
                  onChange={handleChange}
                  placeholder="e.g. Penicillin allergy, lactose intolerant, None..."
                />
              </div>

              <div className="profile-form-group">
                <label>Emergency Contact (Name & Phone)</label>
                <input
                  type="text"
                  name="emergencyContact"
                  value={formData.emergencyContact}
                  onChange={handleChange}
                  placeholder="e.g. Jane Doe (555-0199)"
                />
              </div>

              <button type="submit" className="profile-save-btn">
                Save Details
              </button>
            </form>
          ) : (
            <div className="profile-details-view">
              <div className="profile-avatar-section">
                <div className="profile-avatar">👤</div>
                <h3>{profileDetails.name}</h3>
                <span className="profile-tag">Patient Account</span>
                <span style={{ fontSize: "14px", color: "rgba(218, 226, 253, 0.7)", marginTop: "4px", display: "block" }}>
                  {profileDetails.email}
                </span>
              </div>

              <div className="profile-details-grid">
                <div className="profile-detail-card">
                  <span className="profile-detail-label">AGE</span>
                  <span className="profile-detail-value">{profileDetails.age || "—"} yrs</span>
                </div>

                <div className="profile-detail-card">
                  <span className="profile-detail-label">BLOOD TYPE</span>
                  <span className="profile-detail-value highlight">{profileDetails.bloodType || "—"}</span>
                </div>

                <div className="profile-detail-card">
                  <span className="profile-detail-label">HEIGHT</span>
                  <span className="profile-detail-value">{profileDetails.height || "—"} cm</span>
                </div>

                <div className="profile-detail-card">
                  <span className="profile-detail-label">WEIGHT</span>
                  <span className="profile-detail-value">{profileDetails.weight || "—"} kg</span>
                </div>
              </div>

              <div className="profile-info-section">
                <div className="profile-info-block">
                  <h4>Allergies & Conditions</h4>
                  <p>{profileDetails.allergies || "No allergies or chronic conditions reported."}</p>
                </div>

                <div className="profile-info-block">
                  <h4>Emergency Contact</h4>
                  <p className="contact-text">🚨 {profileDetails.emergencyContact || "No emergency contact set."}</p>
                </div>
              </div>

              <div className="profile-action-buttons">
                <button className="profile-edit-btn" onClick={() => setIsEditing(true)}>
                  Edit Profile
                </button>
                <button className="profile-done-btn" onClick={onClose}>
                  Done
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
