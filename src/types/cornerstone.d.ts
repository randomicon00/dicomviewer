declare module "cornerstone-math";
declare module "cornerstone-wado-image-loader";
declare module "cornerstone-tools";
declare module "hammerjs";
declare module "@heroicons/*";

declare module '@cornerstonejs/dicom-image-loader' {
    export const external: {
        dicomParser: any;
    };
    export const configure: (config: any) => void;
    export const wadouri: {
        fileManager: {
            add: (file: File) => string;
        };
        loadImage: (imageId: string) => Promise<any>;
    };
    export const webWorkerManager: {
        initialize: (config: any) => void;
    };
}
