import { render, screen, waitFor } from '@testing-library/react';
import DicomViewer from '../DicomViewer';

// Mock the cornerstone libraries
jest.mock('@cornerstonejs/core', () => ({
  RenderingEngine: jest.fn().mockImplementation(() => ({
    enableElement: jest.fn(),
    getViewport: jest.fn().mockReturnValue({
      render: jest.fn(),
      setStack: jest.fn(),
      resetCamera: jest.fn(),
      setZoom: jest.fn(),
      resize: jest.fn(),
    }),
  })),
  Enums: {
    ViewportType: {
      STACK: 'stack',
    },
  },
  init: jest.fn().mockResolvedValue(undefined),
  metaData: {
    get: jest.fn(),
  },
}));

jest.mock('@cornerstonejs/tools', () => {
  const toolGroup = {
    addViewport: jest.fn(),
    addTool: jest.fn(),
    setToolActive: jest.fn(),
    setToolPassive: jest.fn(),
  };

  return {
    init: jest.fn().mockImplementation(() => undefined),
    addTool: jest.fn(),
    ToolGroupManager: {
      getToolGroup: jest.fn().mockReturnValue(toolGroup),
      createToolGroup: jest.fn().mockReturnValue(toolGroup),
    },
    ZoomTool: { toolName: 'Zoom' },
    PanTool: { toolName: 'Pan' },
    WindowLevelTool: { toolName: 'WindowLevel' },
    StackScrollMouseWheelTool: { toolName: 'StackScrollMouseWheel' },
    Enums: {
      MouseBindings: {
        Primary: 1,
      },
    },
  };
});

jest.mock('@cornerstonejs/dicom-image-loader', () => ({
  external: {},
  webWorkerManager: {
    initialize: jest.fn(),
  },
  wadouri: {
    loadImage: jest.fn().mockResolvedValue({
      promise: Promise.resolve({}),
    }),
    fileManager: {
      add: jest.fn().mockReturnValue('test-image-id'),
    },
  },
}));

jest.mock('dicom-parser', () => ({
  __esModule: true,
  default: {
    parseDicom: jest.fn().mockReturnValue({
      elements: {},
      string: jest.fn(),
      text: jest.fn(),
    }),
  },
}));

describe('DicomViewer', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders without crashing', async () => {
    render(<DicomViewer />);

    await waitFor(() => {
      expect(screen.getByLabelText(/dicom viewer application/i)).toBeInTheDocument();
    });
  });

  it('renders the drop zone area', async () => {
    render(<DicomViewer />);
    // The component should render a drop zone for DICOM files
    await waitFor(() => {
      expect(screen.getByText(/drop your dicom file here/i)).toBeInTheDocument();
    });
  });

  it('renders file upload button', async () => {
    render(<DicomViewer />);
    // The component should have a browse files button
    await waitFor(() => {
      expect(screen.getByText(/browse files/i)).toBeInTheDocument();
    });
  });
});
