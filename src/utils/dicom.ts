import dicomParser from "dicom-parser";
import { DicomTag } from "../types/dicomTypes";
import { TAG_DICT } from "./constants";

export const extractDicomTags = async (file: File): Promise<DicomTag[]> => {
  const tags = [];

  const arrayBuffer = await file.arrayBuffer();
  const dataSet = dicomParser.parseDicom(new Uint8Array(arrayBuffer));

  const elements = dataSet.elements;
  for (const tag in elements) {
    if (elements.hasOwnProperty(tag)) {
      const tagDescription = TAG_DICT[tag] || { name: "Unknown", vr: "UN" };
      tags.push({
        tag: tag,
        vr: tagDescription.vr,
        name: tagDescription.name,
      });
    }
  }

  return tags;
};
