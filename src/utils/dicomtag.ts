import { DCM_TAG_MAP, DCM_TAG_GROUP_MAP } from "./dicom-maps";

/**
 * Immutable DICOM tag.
 * example: 0100 0010 = Jane Smith 
 */
class DicomTag {
  private groupCode: string;
  private elementCode: string;

  constructor(groupCode: string, elementCode: string) {
    if (!groupCode || groupCode.length !== 4) {
      throw new Error("Invalid group code: " + groupCode);
    }
    if (!elementCode || elementCode.length !== 4) {
      throw new Error("Invalid element code: " + elementCode);
    }
    this.groupCode = groupCode;
    this.elementCode = elementCode;
  }

  getGroupCode(): string {
    return this.groupCode;
  }

  getElementCode(): string {
    return this.elementCode;
  }

  toString(): string {
    return `${this.composeKey()}: ${this.getName()}`;
  }

  isEqualTo(otherTag: DicomTag): boolean {
    return (
      otherTag &&
      this.groupCode === otherTag.getGroupCode() &&
      this.elementCode === otherTag.getElementCode()
    );
  }

  composeKey(): string {
    return this.groupCode + this.elementCode;
  }

  hasValueRepresentation(): boolean {
    return !(
      this.groupCode === "FFFE" &&
      ["E000", "E00D", "E0DD"].includes(this.elementCode)
    );
  }

  isPrivateTag(): boolean {
    return parseInt(this.groupCode, 16) % 2 === 1;
  }

  private fetchTagInfoFromDict(): [string, string, string] | undefined {
    return DCM_TAG_MAP[this.groupCode]?.[this.elementCode];
  }

  getGroupName(): string | undefined {
    return DCM_TAG_GROUP_MAP[this.groupCode];
  }

  getVr(): string | undefined {
    return this.fetchTagInfoFromDict()?.[0];
  }

  getName(): string | undefined {
    return this.fetchTagInfoFromDict()?.[2];
  }
}

/**
 * Function to compare two DICOM tags.
 */
export function compareDicomTags(tagA: DicomTag, tagB: DicomTag): number {
  const compareCode = (codeA: string, codeB: string) =>
    parseInt(codeA, 16) - parseInt(codeB, 16);

  const groupComparison = compareCode(tagA.getGroupCode(), tagB.getGroupCode());
  return groupComparison !== 0
    ? groupComparison
    : compareCode(tagA.getElementCode(), tagB.getElementCode());
}

/**
 * Function to create a DICOM tag from a key string.
 */
export function createTagFromKey(key: string): DicomTag {
  if (!key || key.length !== 8) {
    throw new Error("Invalid key: " + key);
  } else {
    return new DicomTag(key.substring(0, 4), key.substring(4, 8));
  }
}

/**
 * Helper function to create a new DICOM tag from a group and element codes.
 */
export function createDicomTag(groupCode: string, elementCode: string): DicomTag {
  return new DicomTag(groupCode, elementCode);
}

/**
 * Predefined DICOM tags.
 */
const predefinedTags = {
  transferSyntaxUID: createDicomTag("0002", "0010"),
  fileMetaInfoGroupLength: createDicomTag("0002", "0000"),
  item: createDicomTag("FFFE", "E000"),
  itemDelimitation: createDicomTag("FFFE", "E00D"),
  sequenceDelimitation: createDicomTag("FFFE", "E0DD"),
  pixelData: createDicomTag("7FE0", "0010"),
};

/**
 * Helper functions to create predefined DICOM tags.
 */
export function createTransferSyntaxUIDTag(): DicomTag {
  return predefinedTags.transferSyntaxUID;
}

export function createFileMetaInfoGroupLengthTag(): DicomTag {
  return predefinedTags.fileMetaInfoGroupLength;
}

export function createItemTag(): DicomTag {
  return predefinedTags.item;
}

export function createItemDelimitationTag(): DicomTag {
  return predefinedTags.itemDelimitation;
}

export function createSequenceDelimitationTag(): DicomTag {
  return predefinedTags.sequenceDelimitation;
}

export function createPixelDataTag(): DicomTag {
  return predefinedTags.pixelData;
}

/**
 * Helper functions to check if a tag matches a predefined tag.
 */
function isTagEqualToPredefined(
  tag: DicomTag,
  predefinedTag: DicomTag
): boolean {
  return tag.isEqualTo(predefinedTag);
}

export function isFileMetaInfoGroupLengthTag(tag: DicomTag): boolean {
  return isTagEqualToPredefined(tag, predefinedTags.fileMetaInfoGroupLength);
}

export function isItemTag(tag: DicomTag): boolean {
  return tag.composeKey() === predefinedTags.item.composeKey();
}

export function isItemDelimitationTag(tag: DicomTag): boolean {
  return tag.composeKey() === predefinedTags.itemDelimitation.composeKey();
}

export function isSequenceDelimitationTag(tag: DicomTag): boolean {
  return (
    tag.composeKey() === predefinedTags.sequenceDelimitation.composeKey()
  );
}

export function isPixelDataTag(tag: DicomTag): boolean {
  return tag.composeKey() === predefinedTags.pixelData.composeKey();
}

/**
 * Function to retrieve a tag from the dictionary using a tag name.
 */
export function findTagByName(name: string): DicomTag | null {
  for (const groupCode in DCM_TAG_MAP) {
    const elements = DCM_TAG_MAP[groupCode];
    for (const elementCode in elements) {
      const tagInfo = elements[elementCode];
      const tagName = tagInfo[2];
      if (tagName === name) {
        return new DicomTag(groupCode, elementCode);
      }
    }
  }
  return null;
}
