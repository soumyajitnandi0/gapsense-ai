import api from './api';

export interface NotionStatus {
  connected: boolean;
  workspaceName?: string;
  workspaceId?: string;
  connectedAt?: string;
}

export interface NotionConnectResponse {
  url: string;
}

export interface NotionExportResponse {
  message: string;
  pageUrl: string;
  pageId: string;
}

export interface InterviewQuestion {
  question: string;
  type: 'technical' | 'behavioral' | 'system_design';
  expectedAnswer?: string;
  hints?: string[];
}

// Get Notion connection status
export const getNotionStatus = async (): Promise<NotionStatus> => {
  const response = await api.get('/notion/status');
  return response.data;
};

// Get Notion OAuth connection URL
export const connectNotion = async (): Promise<NotionConnectResponse> => {
  const response = await api.get('/notion/connect');
  return response.data;
};

// Disconnect Notion
export const disconnectNotion = async (): Promise<{ message: string }> => {
  const response = await api.delete('/notion/disconnect');
  return response.data;
};

// Export roadmap to Notion
export const exportRoadmapToNotion = async (assessmentId: string): Promise<NotionExportResponse> => {
  const response = await api.post(`/notion/export/roadmap/${assessmentId}`);
  return response.data;
};

// Export interview prep to Notion
export const exportInterviewPrepToNotion = async (
  questions: InterviewQuestion[],
  roleName: string,
  difficulty: string = 'medium'
): Promise<NotionExportResponse> => {
  const response = await api.post('/notion/export/interview-prep', {
    questions,
    roleName,
    difficulty,
  });
  return response.data;
};

// Open Notion OAuth popup
export const openNotionAuthPopup = (authUrl: string): Promise<boolean> => {
  return new Promise((resolve) => {
    const width = 500;
    const height = 600;
    const left = window.screenX + (window.outerWidth - width) / 2;
    const top = window.screenY + (window.outerHeight - height) / 2;

    const popup = window.open(
      authUrl,
      'Notion OAuth',
      `width=${width},height=${height},left=${left},top=${top},toolbar=no,menubar=no,scrollbars=yes`
    );

    if (!popup) {
      resolve(false);
      return;
    }

    const checkClosed = setInterval(() => {
      if (popup.closed) {
        clearInterval(checkClosed);
        resolve(true);
      }
    }, 1000);

    // Listen for OAuth completion message
    const handleMessage = (event: MessageEvent) => {
      if (event.data === 'notion:connected') {
        clearInterval(checkClosed);
        popup.close();
        window.removeEventListener('message', handleMessage);
        resolve(true);
      }
    };

    window.addEventListener('message', handleMessage);

    // Timeout after 5 minutes
    setTimeout(() => {
      clearInterval(checkClosed);
      window.removeEventListener('message', handleMessage);
      popup.close();
      resolve(false);
    }, 300000);
  });
};
