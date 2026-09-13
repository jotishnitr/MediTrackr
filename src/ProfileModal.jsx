import React, { useState, useEffect } from "react";

export default function ProfileModal({
  profileDetails = {},
  setProfileDetails,
  onClose,
  requireAuth,
  setCurrentPage,
  setIsAuthenticated,
}) {
  const safeProfile = profileDetails || {};

  // Check if we need to show the input form first (e.g. if fields like Age, Blood Type are unset)
  const [isEditing, setIsEditing] = useState(() => {
    return !safeProfile.age || !safeProfile.bloodType;
  });

  const [formData, setFormData] = useState({
    name: safeProfile.name || "",
    age: safeProfile.age || "",
    bloodType: safeProfile.bloodType || "",
    height: safeProfile.height || "",
    weight: safeProfile.weight || "",
    allergies: safeProfile.allergies || "",
    emergencyContact: safeProfile.emergencyContact || "",
    email: safeProfile.email || "",
    familyMembersEmails: Array.isArray(safeProfile.familyMembersEmails) ? safeProfile.familyMembersEmails : [],
  });

  const [familyEmailInput, setFamilyEmailInput] = useState("");

  useEffect(() => {
    if (profileDetails) {
      setFormData({
        name: profileDetails.name || "",
        age: profileDetails.age || "",
        bloodType: profileDetails.bloodType || "",
        height: profileDetails.height || "",
        weight: profileDetails.weight || "",
        allergies: profileDetails.allergies || "",
        emergencyContact: profileDetails.emergencyContact || "",
        email: profileDetails.email || "",
        familyMembersEmails: Array.isArray(profileDetails.familyMembersEmails) ? profileDetails.familyMembersEmails : [],
      });
    }
  }, [profileDetails]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleAddFamilyEmail = () => {
    if (!familyEmailInput.trim()) return;

    // Split by comma or space if user pasted multiple emails
    const rawEmails = familyEmailInput.split(/[\s,]+/);
    const newEmails = rawEmails
      .map((e) => e.trim().toLowerCase())
      .filter((e) => e.length > 0 && e.includes("@"));

    if (newEmails.length === 0) return;

    setFormData((prev) => {
      const existing = prev.familyMembersEmails || [];
      const combined = [...existing];
      newEmails.forEach((email) => {
        if (
          !combined.includes(email) &&
          email !== (formData.email || "").toLowerCase()
        ) {
          combined.push(email);
        }
      });
      return {
        ...prev,
        familyMembersEmails: combined,
      };
    });

    setFamilyEmailInput("");
  };

  const handleRemoveFamilyEmail = (emailToRemove) => {
    setFormData((prev) => ({
      ...prev,
      familyMembersEmails: (prev.familyMembersEmails || []).filter(
        (email) => email !== emailToRemove
      ),
    }));
  };

  const handleSave = (e) => {
    e.preventDefault();
    if (typeof requireAuth === "function" && !requireAuth()) return;
    if (!formData.name.trim()) {
      alert("Please enter at least a name.");
      return;
    }

    // Auto-add any typed email if user forgot to click Add
    let finalFamilyEmails = [...(formData.familyMembersEmails || [])];
    if (familyEmailInput.trim()) {
      const pendingEmails = familyEmailInput
        .split(/[\s,]+/)
        .map((em) => em.trim().toLowerCase())
        .filter(
          (em) =>
            em.length > 0 &&
            em.includes("@") &&
            !finalFamilyEmails.includes(em) &&
            em !== (formData.email || "").toLowerCase()
        );
      finalFamilyEmails = [...finalFamilyEmails, ...pendingEmails];
      setFamilyEmailInput("");
    }

    const payload = {
      fullName: formData.name,
      age: formData.age ? Number(formData.age) : undefined,
      bloodType: formData.bloodType,
      height: formData.height ? Number(formData.height) : undefined,
      weight: formData.weight ? Number(formData.weight) : undefined,
      allergies: formData.allergies,
      emergencyContact: formData.emergencyContact,
      familyMembersEmails: finalFamilyEmails,
    };

    // Save to parent state immediately
    setProfileDetails({
      ...formData,
      familyMembersEmails: finalFamilyEmails,
    });

    // Sync weight back to health vitals if weight was updated
    if (formData.weight) {
      localStorage.setItem("weight", formData.weight);
      window.dispatchEvent(new Event("storage"));
    }

    // Sync to backend addHealthProfile
    fetch(`${import.meta.env.VITE_API_URL}/addHealthProfile`, {
      method: "POST",
      credentials: "include",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
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
            familyMembersEmails: profile.familyMembersEmails || finalFamilyEmails,
          };
          setProfileDetails(updatedDetails);
        }
      })
      .catch((err) =>
        console.error("Error saving health profile to backend:", err)
      );

    setIsEditing(false);
  };

  return (
    <div className="profile-modal-overlay">
      <div className="profile-modal">
        <div className="profile-modal-header">
          <h2>{isEditing ? "Edit Health Profile" : "Health Profile"}</h2>
          <button className="profile-close-btn" onClick={onClose}>
            ✕
          </button>
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
                  style={{
                    opacity: 0.6,
                    cursor: "not-allowed",
                    background: "rgba(255, 255, 255, 0.05)",
                  }}
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

              <div className="profile-form-group">
                <label>Family Members (Link by Email)</label>
                <div className="family-email-input-row">
                  <input
                    type="email"
                    value={familyEmailInput}
                    onChange={(e) => setFamilyEmailInput(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        e.preventDefault();
                        handleAddFamilyEmail();
                      }
                    }}
                    placeholder="e.g. member@gmail.com"
                  />
                  <button
                    type="button"
                    className="family-add-btn"
                    onClick={handleAddFamilyEmail}
                  >
                    + Add
                  </button>
                </div>

                {formData.familyMembersEmails &&
                  formData.familyMembersEmails.length > 0 && (
                    <div className="family-emails-tags">
                      {formData.familyMembersEmails.map((email, idx) => (
                        <div key={idx} className="family-email-tag">
                          <span className="family-tag-icon">👤</span>
                          <span className="family-tag-text">{email}</span>
                          <button
                            type="button"
                            className="family-tag-remove"
                            onClick={() => handleRemoveFamilyEmail(email)}
                            title="Remove member"
                          >
                            ✕
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                <span className="profile-input-hint">
                  Enter registered emails of family members to link and share health tracking.
                </span>
              </div>

              <button type="submit" className="profile-save-btn">
                Save Details
              </button>
            </form>
          ) : (
            <div className="profile-details-view">
              <div className="profile-avatar-section">
                <div className="profile-avatar">👤</div>
                <h3>{safeProfile.name || "User"}</h3>
                <span className="profile-tag">Patient Account</span>
                <span
                  style={{
                    fontSize: "14px",
                    color: "rgba(218, 226, 253, 0.7)",
                    marginTop: "4px",
                    display: "block",
                  }}
                >
                  {safeProfile.email || ""}
                </span>
              </div>

              <div className="profile-details-grid">
                <div className="profile-detail-card">
                  <span className="profile-detail-label">AGE</span>
                  <span className="profile-detail-value">
                    {safeProfile.age || "—"} yrs
                  </span>
                </div>

                <div className="profile-detail-card">
                  <span className="profile-detail-label">BLOOD TYPE</span>
                  <span className="profile-detail-value highlight">
                    {safeProfile.bloodType || "—"}
                  </span>
                </div>

                <div className="profile-detail-card">
                  <span className="profile-detail-label">HEIGHT</span>
                  <span className="profile-detail-value">
                    {safeProfile.height || "—"} cm
                  </span>
                </div>

                <div className="profile-detail-card">
                  <span className="profile-detail-label">WEIGHT</span>
                  <span className="profile-detail-value">
                    {safeProfile.weight || "—"} kg
                  </span>
                </div>
              </div>

              <div className="profile-info-section">
                <div className="profile-info-block">
                  <h4>Allergies & Conditions</h4>
                  <p>
                    {safeProfile.allergies ||
                      "No allergies or chronic conditions reported."}
                  </p>
                </div>

                <div className="profile-info-block">
                  <h4>Emergency Contact</h4>
                  <p className="contact-text">
                    🚨 {safeProfile.emergencyContact || "No emergency contact set."}
                  </p>
                </div>

                <div className="profile-info-block family-block">
                  <h4>Linked Family Members</h4>
                  {safeProfile.familyMembersEmails &&
                  safeProfile.familyMembersEmails.length > 0 ? (
                    <div className="family-view-list">
                      {safeProfile.familyMembersEmails.map((email, idx) => (
                        <span key={idx} className="family-view-pill">
                          <span className="pill-icon">👥</span> {email}
                        </span>
                      ))}
                    </div>
                  ) : (
                    <p>No family members linked yet. Click "Edit Profile" to link members.</p>
                  )}
                </div>
              </div>

              <div className="profile-action-buttons">
                <button
                  className="profile-edit-btn"
                  onClick={() => setIsEditing(true)}
                >
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
