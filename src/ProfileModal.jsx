import React, { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import LanguageSelector from "./LanguageSelector";

export default function ProfileModal({
  profileDetails = {},
  setProfileDetails,
  onClose,
  requireAuth,
  setCurrentPage,
  setIsAuthenticated,
}) {
  const { t } = useTranslation();
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
    familyMembers: Array.isArray(safeProfile.familyMembers) ? safeProfile.familyMembers : [],
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
        familyMembers: Array.isArray(profileDetails.familyMembers) ? profileDetails.familyMembers : [],
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

  const getMemberStatus = (email) => {
    const clean = (email || "").toLowerCase();
    if (Array.isArray(safeProfile.familyMembers)) {
      const found = safeProfile.familyMembers.find(
        (m) => (m.email || "").toLowerCase() === clean
      );
      if (found) return found.status;
    }
    if (Array.isArray(safeProfile.connectedFamilyEmails) && safeProfile.connectedFamilyEmails.map(e => e.toLowerCase()).includes(clean)) {
      return "connected";
    }
    return "pending";
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
      familyMembers: (prev.familyMembers || []).filter(
        (m) => (typeof m === "object" ? m.email : m) !== emailToRemove
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
            email: formData.email,
            familyMembers: profile.familyMembers || [],
            familyMembersEmails: profile.familyMembersEmails || finalFamilyEmails,
            connectedFamilyEmails: profile.connectedFamilyEmails || [],
            pendingFamilyEmails: profile.pendingFamilyEmails || [],
          };
          setProfileDetails(updatedDetails);
        }
      })
      .catch((err) =>
        console.error("Error saving health profile to backend:", err)
      );

    setIsEditing(false);
  };

  const getDisplayFamilyMembers = () => {
    if (Array.isArray(safeProfile.familyMembers) && safeProfile.familyMembers.length > 0) {
      return safeProfile.familyMembers;
    }
    if (Array.isArray(safeProfile.familyMembersEmails) && safeProfile.familyMembersEmails.length > 0) {
      return safeProfile.familyMembersEmails.map((email) => ({
        email,
        name: "",
        status: getMemberStatus(email),
      }));
    }
    return [];
  };

  const displayMembers = getDisplayFamilyMembers();

  return (
    <div className="profile-modal-overlay">
      <div className="profile-modal">
        <div className="profile-modal-content">
          <div className="profile-modal-header">
            <h2>{t("profile.title", "Health & Family Profile")}</h2>
            <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
              <LanguageSelector variant="header" />
              <button className="profile-close-btn" onClick={onClose}>
                ✕
              </button>
            </div>
          </div>

          {isEditing ? (
            <form onSubmit={handleSave} className="profile-form">
              <div className="profile-form-group">
                <label>{t("profile.fullName", "Full Name")}</label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  placeholder="e.g. John Doe"
                  required
                />
              </div>

              <div className="profile-form-row">
                <div className="profile-form-group">
                  <label>{t("profile.age", "Age")}</label>
                  <input
                    type="number"
                    name="age"
                    value={formData.age}
                    onChange={handleChange}
                    placeholder="e.g. 28"
                  />
                </div>

                <div className="profile-form-group">
                  <label>{t("profile.bloodGroup", "Blood Type")}</label>
                  <select
                    name="bloodType"
                    value={formData.bloodType}
                    onChange={handleChange}
                  >
                    <option value="">Select Blood Group</option>
                    <option value="A+">A+</option>
                    <option value="A-">A-</option>
                    <option value="B+">B+</option>
                    <option value="B-">B-</option>
                    <option value="AB+">AB+</option>
                    <option value="AB-">AB-</option>
                    <option value="O+">O+</option>
                    <option value="O-">O-</option>
                  </select>
                </div>
              </div>

              <div className="profile-form-row">
                <div className="profile-form-group">
                  <label>{t("profile.height", "Height (cm)")}</label>
                  <input
                    type="number"
                    name="height"
                    value={formData.height}
                    onChange={handleChange}
                    placeholder="e.g. 175"
                  />
                </div>

                <div className="profile-form-group">
                  <label>{t("profile.weight", "Weight (kg)")}</label>
                  <input
                    type="number"
                    name="weight"
                    value={formData.weight}
                    onChange={handleChange}
                    placeholder="e.g. 70"
                  />
                </div>
              </div>

              <div className="profile-form-group">
                <label>{t("profile.allergies", "Known Allergies / Chronic Conditions")}</label>
                <input
                  type="text"
                  name="allergies"
                  value={formData.allergies}
                  onChange={handleChange}
                  placeholder="e.g. Penicillin allergy, lactose intolerant, None..."
                />
              </div>

              <div className="profile-form-group">
                <label>{t("profile.emergencyContact", "Emergency Contact (Name & Phone)")}</label>
                <input
                  type="text"
                  name="emergencyContact"
                  value={formData.emergencyContact}
                  onChange={handleChange}
                  placeholder="e.g. Jane Doe (555-0199)"
                />
              </div>

              <div className="profile-form-group">
                <label>{t("profile.familyConnections", "Family Members (Link by Email)")}</label>
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
                    placeholder={t("profile.familyEmailPlaceholder", "e.g. member@gmail.com")}
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
                      {formData.familyMembersEmails.map((email, idx) => {
                        const status = getMemberStatus(email);
                        return (
                          <div key={idx} className={`family-email-tag ${status}`}>
                            <span className="family-tag-icon">👤</span>
                            <span className="family-tag-text">{email}</span>
                            <span className={`family-tag-status-badge ${status}`}>
                              {status === "connected" ? "Connected" : "Pending"}
                            </span>
                            <button
                              type="button"
                              className="family-tag-remove"
                              onClick={() => handleRemoveFamilyEmail(email)}
                              title="Remove member"
                            >
                              ✕
                            </button>
                          </div>
                        );
                      })}
                    </div>
                  )}
                <span className="profile-input-hint">
                  Adding a family member will send them a connection request. They must accept the request in their notification drawer to establish connection.
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
                  {displayMembers && displayMembers.length > 0 ? (
                    <div className="family-view-list">
                      {displayMembers.map((member, idx) => {
                        const email = typeof member === "object" ? member.email : member;
                        const status = typeof member === "object" && member.status ? member.status : getMemberStatus(email);
                        const isConnected = status === "connected";

                        return (
                          <div key={idx} className={`family-view-card ${isConnected ? "connected" : "pending"}`}>
                            <div className="family-view-main">
                              <span className="pill-icon">👥</span>
                              <div className="family-view-info">
                                <span className="family-member-email">{email}</span>
                                {member.name && <span className="family-member-name">{member.name}</span>}
                              </div>
                            </div>
                            <span className={`family-view-status-badge ${isConnected ? "connected" : "pending"}`}>
                              {isConnected ? "✓ Connected" : "⏳ Pending Acceptance"}
                            </span>
                          </div>
                        );
                      })}
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
