export type DicomTag = {
  tag: string;
  vr: string;
  vm?: string;
  name: string;
};

export type TagDict = {
  [key: string]: DicomTag;
};

export type DicomTagInfo = [string, string, string];
export type DicomTagMap = Record<string, Record<string, DicomTagInfo>>;
export type DicomTagGroupMap = Record<string, string>;
