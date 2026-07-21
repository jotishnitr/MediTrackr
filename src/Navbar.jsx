export default function Navbar({ currentPage, setCurrentPage, profileDetails, setShowProfileModal, isSidebarOpen, setIsSidebarOpen }) {
  return (
    <>
      {/* Mobile Sticky Header */}
      <div className="mobile-header">
        <button className="menu-toggle-btn" onClick={() => setIsSidebarOpen(true)} aria-label="Open Menu">
          <span className="material-symbols-outlined">menu</span>
        </button>
        <div className="mobile-logo-container">
          <img className="mobile-logo-icon" src="icon.png" alt="logo" />
          <span className="mobile-logo-title">MediTrackr</span>
        </div>
        <div className="mobile-profile-avatar" onClick={() => setShowProfileModal(true)}>
          <img src="person-logo.png" className="person-logo-small" alt="avatar" />
        </div>
      </div>

      {/* Mobile Drawer Backdrop Overlay */}
      {isSidebarOpen && (
        <div className="sidebar-backdrop" onClick={() => setIsSidebarOpen(false)} />
      )}

      {/* Sidebar Navigation Panel */}
      <section className={`navbar ${isSidebarOpen ? "open" : ""}`}>
        <div className="navbar-top">
          {/* Mobile sidebar close button */}
          <div className="mobile-sidebar-close">
            <button onClick={() => setIsSidebarOpen(false)} aria-label="Close Menu">
              <span className="material-symbols-outlined">close</span>
            </button>
          </div>

          <div className="navbar-header-container">
            <div><img className="navbar-icon-container" src="icon.png" alt="icon"></img></div>
            <div className="navbar-title-container">
              <div className="navbar-title">MediTrackr</div>
              <div className="navbar-tagline">HEALTH OS</div>
            </div>
          </div>

          <div className="navbar-links-container">
            <div className="navbar-headers">OVERVIEW</div>

            <div
              className={currentPage === "Dashboard" ? "navbar-link-container active" : "navbar-link-container"}
              onClick={() => {
                setCurrentPage("Dashboard");
                setIsSidebarOpen(false);
              }}
            >
              <div><img src="dashboard.png" className="navbar-icons" alt="dashboard"></img></div>
              <div className="navbar-link">Dashboard</div>
            </div>

            <div className="navbar-headers">MEDICINES</div>

            <div
              className={currentPage === "myMedicines" ? "navbar-link-container active" : "navbar-link-container"}
              onClick={() => {
                setCurrentPage("myMedicines");
                setIsSidebarOpen(false);
              }}
            >
              <div><img src="myMedicines.png" className="navbar-icons" alt="medicines"></img></div>
              <div className="navbar-link">My Medicines</div>
            </div>

            <div
              className={currentPage === "Remainders" ? "navbar-link-container active" : "navbar-link-container"}
              onClick={() => {
                setCurrentPage("Remainders");
                setIsSidebarOpen(false);
              }}
            >
              <div><img src="reminders.png" className="navbar-icons" alt="reminders"></img></div>
              <div className="navbar-link">Reminders</div>
            </div>

            <div
              className={currentPage === "SearchMedicines" ? "navbar-link-container active" : "navbar-link-container"}
              onClick={() => {
                setCurrentPage("SearchMedicines");
                setIsSidebarOpen(false);
              }}
            >
              <div><img src="searchMedicines.png" className="navbar-icons" alt="search"></img></div>
              <div className="navbar-link">Search Medicines</div>
            </div>

            <div className="navbar-headers">WELLNESS</div>
            <div
              className={currentPage === "HealthLog" ? "navbar-link-container active" : "navbar-link-container"}
              onClick={() => {
                setCurrentPage("HealthLog");
                setIsSidebarOpen(false);
              }}
            >
              <div><img src="healthLog.png" className="navbar-icons" alt="health log"></img></div>
              <div className="navbar-link">Health Log</div>
            </div>

          </div>
        </div>

        <div className="navbar-bottom">
          <div
            className="profile-container"
            onClick={() => {
              setShowProfileModal(true);
              setIsSidebarOpen(false);
            }}
            style={{ cursor: "pointer" }}
          >
            <div className="profile-left">
              <div><img src="person-logo.png" className="person-logo" alt="profile logo"></img></div>

              <div className="person-details-container">
                <div className="person-name">{profileDetails?.name || "Set Profile"}</div>
                <div className="account-type">{profileDetails?.bloodType ? `Blood Type: ${profileDetails.bloodType}` : "Personal account"}</div>
              </div>
            </div>
            <div className="sensors-container"><img src="sensors.png" className="sensors" alt="sensors"></img></div>
          </div>

          <button
            className="logout-btn"
            onClick={async (e) => {
              e.stopPropagation();
              try {
                const response = await fetch(`${import.meta.env.VITE_API_URL}/logout`, {
                  method: "POST",
                  credentials: "include",
                });
                if (response.ok) {
                  setCurrentPage("Login");
                } else {
                  console.error("Logout request failed");
                  setCurrentPage("Login");
                }
              } catch (err) {
                console.error("Logout failed:", err);
                setCurrentPage("Login");
              }
            }}
          >
            <span className="material-symbols-outlined logout-icon">logout</span>
            <span>Sign Out</span>
          </button>
        </div>
      </section>
    </>
  );
}