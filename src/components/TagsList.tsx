import React, { ChangeEvent, useCallback, useEffect, useMemo, useState } from "react";
import { MagnifyingGlassIcon } from "@heroicons/react/16/solid";
import { TAG_DICT } from "../utils/constants";

interface TagData {
  [key: string]: {
    value: any;
    vr?: string;
  };
}

interface MetaItem {
  name: string;
  value: string;
}

interface TagsTableProps {
  data: TagData;
}

const normalizeTag = (rawTag: string): string => {
  if (rawTag.startsWith("x") && rawTag.length === 9) {
    return rawTag.substring(1).toUpperCase();
  }

  if (rawTag.length === 8 && /^[0-9A-Fa-f]+$/.test(rawTag)) {
    return rawTag.toUpperCase();
  }

  return rawTag.replace(/[^0-9A-Fa-f]/g, "").toUpperCase().padStart(8, "0");
};

const formatValue = (value: any, vr?: string): string => {
  let displayValue = value;

  if (displayValue === undefined || displayValue === null) {
    return "N/A";
  }

  if (typeof displayValue === "string") {
    displayValue = displayValue
      .replace(/[\u0000-\u001F\u007F-\u009F]/g, "")
      .replace(/\uFFFD/g, "")
      .trim();

    if (!displayValue) {
      return "N/A";
    }
  } else {
    displayValue = String(displayValue);
  }

  if (vr === "DA" && displayValue.length === 8) {
    return `${displayValue.substring(0, 4)}-${displayValue.substring(4, 6)}-${displayValue.substring(6, 8)}`;
  }

  if (vr === "TM" && displayValue.length >= 6) {
    return `${displayValue.substring(0, 2)}:${displayValue.substring(2, 4)}:${displayValue.substring(4, 6)}`;
  }

  return displayValue;
};

const TagsList: React.FC<TagsTableProps> = ({ data: fullMetaData }) => {
  const [search, setSearch] = useState("");
  const [selectedImageIndex, setSelectedImageIndex] = useState(1);
  const [selectedImageIndices, setSelectedImageIndices] = useState<number[]>([1]);
  const [sliderMin, setSliderMin] = useState(0);
  const [sliderMax, setSliderMax] = useState(0);

  const metaItems = useCallback((): MetaItem[] => {
    if (!fullMetaData || typeof fullMetaData !== "object") {
      return [];
    }

    return Object.keys(fullMetaData).reduce((acc: MetaItem[], key: string) => {
      const tagElement = fullMetaData[key];
      if (!tagElement) return acc;

      const cleanTag = normalizeTag(key);
      const formattedTag = `(${cleanTag.substring(0, 4)},${cleanTag.substring(4, 8)})`;
      const tagInfo = TAG_DICT[cleanTag.toLowerCase()];
      const tagName = tagInfo ? tagInfo.name : "Unknown Tag";

      acc.push({
        name: `${formattedTag} ${tagName}`,
        value: formatValue(tagElement.value, tagElement.vr),
      });

      return acc;
    }, []);
  }, [fullMetaData]);

  const filteredTagsData = useMemo(() => {
    const items = metaItems();
    const searchLower = search.toLowerCase();

    if (!searchLower) {
      return items;
    }

    return items.filter((item) =>
      item.name.toLowerCase().includes(searchLower) || item.value.toLowerCase().includes(searchLower)
    );
  }, [metaItems, search]);

  useEffect(() => {
    const dicomInstanceInfo = fullMetaData?.["00200013"];
    const rawImageNumbers = dicomInstanceInfo?.value;
    const imageNumbers = Array.isArray(rawImageNumbers)
      ? rawImageNumbers
      : rawImageNumbers !== undefined
        ? [rawImageNumbers]
        : [];

    const orderedImageNumbers = imageNumbers
      .map((item) => Number(item))
      .filter((item) => Number.isFinite(item))
      .sort((a, b) => a - b);

    if (orderedImageNumbers.length > 0) {
      setSelectedImageIndices(orderedImageNumbers);
      setSliderMin(0);
      setSliderMax(orderedImageNumbers.length - 1);
      setSelectedImageIndex(orderedImageNumbers[0]);
      return;
    }

    setSelectedImageIndices([1]);
    setSliderMin(0);
    setSliderMax(0);
    setSelectedImageIndex(1);
  }, [fullMetaData]);

  const handleSliderChange = (event: ChangeEvent<HTMLInputElement>) => {
    const sliderValue = parseInt(event.target.value, 10);
    const newSelectedImageIndex = selectedImageIndices[sliderValue];
    if (newSelectedImageIndex === undefined) return;
    setSelectedImageIndex(newSelectedImageIndex);
  };

  const handleSearch = (event: ChangeEvent<HTMLInputElement>) => {
    setSearch(event.target.value);
  };

  const sliderValue = Math.max(0, selectedImageIndices.indexOf(selectedImageIndex));

  return (
    <div className="h-full min-h-0 flex flex-col overflow-hidden">
      <div className="bg-white flex-1 flex flex-col min-h-0">
        <div className="flex flex-col h-full p-1 sm:p-2 min-h-0">
          <div className="flex flex-col gap-3 mb-3 flex-shrink-0 sm:flex-row sm:gap-4">
            <div className="relative w-full sm:basis-1/2">
              <input
                type="search"
                value={search}
                onChange={handleSearch}
                className="text-gray-700 w-full border border-gray-300 pl-10 pr-4 py-2 rounded-md focus:outline-none focus:ring focus:ring-gray-300 focus:border-gray-500"
                placeholder="Search tags or values..."
                aria-label="Search tags"
              />
              <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                <MagnifyingGlassIcon className="h-5 w-5 text-gray-500" />
              </div>
            </div>

            <div className="w-full sm:basis-1/2 flex items-center gap-3">
              <input
                type="range"
                min={sliderMin}
                max={sliderMax}
                value={sliderValue}
                onChange={handleSliderChange}
                className="w-full"
                aria-label="Image index selector"
              />
              <div className="w-12 text-sm font-medium text-gray-700 text-right">{selectedImageIndex}</div>
            </div>
          </div>

          <div className="flex-1 min-h-0 overflow-auto rounded-md border border-gray-200">
            <table className="w-full divide-y divide-gray-200 table-auto">
              <thead className="bg-gray-100 sticky top-0 z-10">
                <tr>
                  <th
                    scope="col"
                    className="px-3 py-2 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider"
                  >
                    Tag
                  </th>
                  <th
                    scope="col"
                    className="px-3 py-2 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider"
                  >
                    Value
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-100">
                {filteredTagsData.length === 0 && (
                  <tr>
                    <td className="px-3 py-3 text-sm text-gray-500" colSpan={2}>
                      No tags found.
                    </td>
                  </tr>
                )}

                {filteredTagsData.map((item, index) => (
                  <tr key={index}>
                    <td className="px-3 py-2 align-top whitespace-nowrap text-xs sm:text-sm text-gray-900 font-medium">
                      {item.name}
                    </td>
                    <td className="px-3 py-2 align-top whitespace-normal break-all text-xs sm:text-sm text-gray-700">
                      {item.value}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TagsList;
