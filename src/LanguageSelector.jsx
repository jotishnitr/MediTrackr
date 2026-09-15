import React, { useState, useRef, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { SUPPORTED_LANGUAGES } from "./i18n";
import "./languageSelector.css";

export default function LanguageSelector({ variant = "header" }) {
  const { i18n, t } = useTranslation();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  const currentLangCode = i18n.language || "en";
  const currentLang =
    SUPPORTED_LANGUAGES.find(
      (l) => l.code === currentLangCode || currentLangCode.startsWith(l.code)
    ) || SUPPORTED_LANGUAGES[0];

  const handleSelectLanguage = (code, e) => {
    if (e) e.stopPropagation();
    i18n.changeLanguage(code);
    setIsOpen(false);
  };

  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div
      className={`lang-selector-container ${variant} ${isOpen ? "open" : ""}`}
      ref={dropdownRef}
      onClick={(e) => e.stopPropagation()}
    >
      <button
        type="button"
        className="lang-trigger-btn"
        onClick={(e) => {
          e.stopPropagation();
          setIsOpen((prev) => !prev);
        }}
        aria-expanded={isOpen}
        aria-haspopup="listbox"
        title={t("nav.selectLanguage", "Select Language")}
      >
        <span className="material-symbols-outlined lang-icon">translate</span>
        <span className="lang-label">{currentLang.nativeName}</span>
        <span className="material-symbols-outlined lang-arrow">
          {isOpen ? "expand_less" : "expand_more"}
        </span>
      </button>

      {isOpen && (
        <div
          className="lang-dropdown-menu"
          role="listbox"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="lang-dropdown-header">
            <span className="material-symbols-outlined header-icon">language</span>
            <span>{t("nav.selectLanguage", "Select Language")}</span>
          </div>
          <div className="lang-options-list">
            {SUPPORTED_LANGUAGES.map((lang) => {
              const isSelected =
                lang.code === currentLangCode || currentLangCode.startsWith(lang.code);
              return (
                <button
                  key={lang.code}
                  type="button"
                  role="option"
                  aria-selected={isSelected}
                  className={`lang-option-item ${isSelected ? "selected" : ""}`}
                  onClick={(e) => handleSelectLanguage(lang.code, e)}
                >
                  <div className="lang-option-text">
                    <span className="lang-native-name">{lang.nativeName}</span>
                    <span className="lang-eng-name">{lang.name}</span>
                  </div>
                  {isSelected && (
                    <span className="material-symbols-outlined check-icon">
                      check
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
