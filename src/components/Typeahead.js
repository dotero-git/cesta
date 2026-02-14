import React, { useState, useMemo, useRef, useEffect } from "react";
import { PiMagnifyingGlassBold } from "react-icons/pi";

function Typeahead({ options, placeholder, onSelect }) {
  const [inputValue, setInputValue] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  const [highlightIndex, setHighlightIndex] = useState(-1);

  const listRef = useRef(null);
  const inputRef = useRef(null);

  const filteredOptions = useMemo(
    () =>
      options.filter((o) =>
        o.label.toLowerCase().includes(inputValue.toLowerCase())
      ),
    [options, inputValue]
  );

  // Close on outside click
  useEffect(() => {
    function handleClickOutside(e) {
      if (
        listRef.current &&
        !listRef.current.contains(e.target) &&
        inputRef.current &&
        !inputRef.current.contains(e.target)
      ) {
        setIsOpen(false);
        setHighlightIndex(-1);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleChange = (e) => {
    const value = e.target.value;
    setInputValue(value);
    setIsOpen(value.length > 0 && filteredOptions.length > 0);
    setHighlightIndex(-1);
  };

  const handleSelect = (option) => {
    setInputValue(option.label);
    setIsOpen(false);
    setHighlightIndex(-1);
    if (onSelect) onSelect(option);
  };

  const handleKeyDown = (e) => {
    if (!isOpen && (e.key === "ArrowDown" || e.key === "ArrowUp")) {
      if (filteredOptions.length > 0) {
        setIsOpen(true);
        setHighlightIndex(
          e.key === "ArrowDown" ? 0 : filteredOptions.length - 1
        );
      }
      return;
    }

    switch (e.key) {
      case "ArrowDown":
        e.preventDefault();
        if (filteredOptions.length === 0) return;
        setHighlightIndex((prev) => {
          const next = prev + 1;
          return next >= filteredOptions.length ? 0 : next;
        });
        break;
      case "ArrowUp":
        e.preventDefault();
        if (filteredOptions.length === 0) return;
        setHighlightIndex((prev) => {
          const next = prev - 1;
          return next < 0 ? filteredOptions.length - 1 : next;
        });
        break;
      case "Enter":
        if (highlightIndex >= 0 && highlightIndex < filteredOptions.length) {
          e.preventDefault();
          handleSelect(filteredOptions[highlightIndex]);
        }
        break;
      case "Escape":
        setIsOpen(false);
        setHighlightIndex(-1);
        break;
      default:
        break;
    }
  };

  return (
    <div className="flex" style={{ position: "relative", width: "80%", margin: "10px" }}>
      <input
        ref={inputRef}
        type="text"
        class="p-4"
        value={inputValue}
        placeholder={placeholder}
        onChange={handleChange}
        onFocus={() => {
          if (filteredOptions.length > 0 && inputValue) {
            setIsOpen(true);
          }
        }}
        onKeyDown={handleKeyDown}
        aria-autocomplete="list"
        aria-expanded={isOpen}
        aria-controls="typeahead-listbox"
        style={{ width: "100%" }}
      />
      <PiMagnifyingGlassBold style={{ margin:"4px" }} />

      {isOpen && filteredOptions.length > 0 && (
        <ul
          id="typeahead-listbox"
          ref={listRef}
          role="listbox"
          style={{
            position: "absolute",
            top: "100%",
            left: 0,
            right: 0,
            border: "1px solid #ccc",
            background: "#fff",
            margin: 0,
            padding: 0,
            listStyle: "none",
            maxHeight: "200px",
            overflowY: "auto",
            zIndex: 1000,
          }}
        >
          {filteredOptions.map((option, index) => (
            <li
              key={option.id}
              role="option"
              aria-selected={highlightIndex === index}
              onMouseDown={(e) => {
                e.preventDefault(); // prevent blur before click
                handleSelect(option);
              }}
              onMouseEnter={() => setHighlightIndex(index)}
              style={{
                padding: "4px 8px",
                background:
                  highlightIndex === index ? "#007bff" : "transparent",
                color: highlightIndex === index ? "#fff" : "#000",
                cursor: "pointer",
              }}
            >
              {option.label}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

export default Typeahead;
