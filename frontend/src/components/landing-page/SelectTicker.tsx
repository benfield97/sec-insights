// Import necessary React functionalities and types
import React, { Dispatch, SetStateAction, useEffect, useState } from "react";
// Import Ticker type
import type { Ticker } from "~/types/document";
// Import useCombobox from Downshift for creating combobox UI
import { useCombobox } from "downshift";
// Import cx for conditional class name handling
import cx from "classnames";
// Import icon from react-icons library
import { HiOutlineBuildingOffice2 } from "react-icons/hi2";
// Custom hook for managing focus
import useFocus from "~/hooks/utils/useFocus";

// Function to filter Ticker data based on input value
function getTickerFilter(inputValue: string) {
  // Convert input value to lower case for case-insensitive comparison
  const lowerCasedInputValue = inputValue.toLowerCase();

  // Return a function that filters tickers
  return function tickerFilter(ticker: Ticker) {
    // Return true if input is empty or ticker name or ticker symbol includes the input value
    return (
      !inputValue ||
      ticker.fullName.toLowerCase().includes(lowerCasedInputValue) ||
      ticker.ticker.toLowerCase().includes(lowerCasedInputValue)
    );
  };
}

// Props type for DocumentSelectCombobox component
interface DocumentSelectComboboxProps {
  selectedItem: Ticker | null;
  setSelectedItem: (ticker: Ticker) => void;
  availableDocuments: Ticker[];
  shouldFocusTicker: boolean;
  setFocusState: Dispatch<SetStateAction<boolean>>;
}

// Component for selecting documents using a combobox
export const DocumentSelectCombobox: React.FC<DocumentSelectComboboxProps> = ({
  selectedItem,
  availableDocuments,
  setSelectedItem,
  shouldFocusTicker,
  setFocusState,
}) => {
  // Custom hook for managing input focus
  const [focusRef, setFocus] = useFocus<HTMLInputElement>();

  // Effect to handle auto-focus when required
  useEffect(() => {
    if (shouldFocusTicker) {
      setInputValue("");
      setFocus();
      setFocusState(false);
    }
  }, [shouldFocusTicker]);

  // State for managing filtered documents
  const [filteredDocuments, setFilteredDocuments] =
    useState<Ticker[]>(availableDocuments);

  // Update filtered documents when available documents change
  useEffect(() => {
    setFilteredDocuments(availableDocuments);
  }, [availableDocuments]);

  // useCombobox hook for creating combobox behavior
  const {
    isOpen,
    getMenuProps,
    getInputProps,
    highlightedIndex,
    getItemProps,
    setInputValue,
  } = useCombobox({
    // Handler for input value change
    onInputValueChange({ inputValue }) {
      if (inputValue) {
        setFilteredDocuments(
          availableDocuments.filter(getTickerFilter(inputValue))
        );
      } else {
        setFilteredDocuments(availableDocuments);
      }
    },
    // Items for the combobox
    items: filteredDocuments,
    // Function to convert item to string
    itemToString(item) {
      return item ? item.ticker : "";
    },
    // Currently selected item
    selectedItem,
    // Handler for when selected item changes
    onSelectedItemChange: ({ selectedItem: newSelectedItem }) => {
      if (newSelectedItem) {
        setSelectedItem(newSelectedItem);
      }
    },
  });

  // Render component
  return (
    <div className="flex-grow">
      <div className="flex flex-col gap-1 rounded-s bg-[#F7F7F7]">
        <div className="flex items-center justify-center gap-0.5 shadow-sm">
          <div className="ml-2">
            {/* Icon for the search box */}
            <HiOutlineBuildingOffice2 size={20} />
          </div>
          {/* Search input field */}
          <input
            placeholder="Search by company ticker or name"
            className="align-center mt-[5px] w-full p-1.5 focus:outline-none "
            {...getInputProps({ ref: focusRef })}
            style={{ backgroundColor: "#F7F7F7" }}
          />
        </div>
      </div>
      {/* Dropdown list for search results */}
      <ul
        className={`absolute z-20 mt-1 max-h-72 w-72 overflow-scroll bg-white p-0 shadow-md ${
          // Hide dropdown if not open or no items
          !(isOpen && filteredDocuments.length) && "hidden"
        }`}
        {...getMenuProps()}
      >
        {isOpen &&
          filteredDocuments.map((item, index) => (
            <li
              // Apply different styles for highlighted and selected items
              className={cx(
                highlightedIndex === index && "bg-[#818BE7] text-white",
                selectedItem === item && "font-bold",
                "z-20 flex flex-col px-3 py-2 shadow-sm"
              )}
              key={`${item.fullName}${index}`}
              {...getItemProps({ item, index })}
            >
              {/* Display full name and ticker of the item */}
              <span>{item.fullName}</span>
              <span className="text-sm ">{item.ticker}</span>
            </li>
          ))}
      </ul>
    </div>
  );
};
