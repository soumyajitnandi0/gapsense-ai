'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Loader2, Check, BookOpen, FileText, ExternalLink } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  connectNotion,
  getNotionStatus,
  disconnectNotion,
  exportRoadmapToNotion,
  exportInterviewPrepToNotion,
  NotionStatus,
  InterviewQuestion,
} from '@/lib/notionApi';

interface NotionExportButtonProps {
  type: 'roadmap' | 'interview';
  assessmentId?: string;
  roleName?: string;
  questions?: InterviewQuestion[];
  difficulty?: string;
  variant?: 'default' | 'outline' | 'ghost';
  size?: 'default' | 'sm' | 'lg';
  className?: string;
}

export default function NotionExportButton({
  type,
  assessmentId,
  roleName = 'Career Roadmap',
  questions = [],
  difficulty = 'medium',
  variant = 'outline',
  size = 'default',
  className = '',
}: NotionExportButtonProps) {
  const { toast } = useToast();
  const [status, setStatus] = useState<NotionStatus | null>(null);
  const [loading, setLoading] = useState(false);
  const [exporting, setExporting] = useState(false);
  const [exportedUrl, setExportedUrl] = useState<string | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);

  useEffect(() => {
    checkStatus();
  }, []);

  const checkStatus = async () => {
    try {
      const data = await getNotionStatus();
      setStatus(data);
    } catch (error) {
      console.error('Failed to check Notion status:', error);
    }
  };

  const handleConnect = async () => {
    setLoading(true);
    try {
      const { url } = await connectNotion();
      window.location.href = url;
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to connect to Notion. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDisconnect = async () => {
    setLoading(true);
    try {
      await disconnectNotion();
      setStatus({ connected: false });
      toast({
        title: 'Disconnected',
        description: 'Notion workspace disconnected successfully.',
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to disconnect Notion.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleExport = async () => {
    setExporting(true);
    try {
      let result;
      if (type === 'roadmap' && assessmentId) {
        result = await exportRoadmapToNotion(assessmentId);
      } else if (type === 'interview') {
        result = await exportInterviewPrepToNotion(questions, roleName, difficulty);
      } else {
        throw new Error('Invalid export type or missing data');
      }

      setExportedUrl(result.pageUrl);
      toast({
        title: 'Export Successful',
        description: `Your ${type === 'roadmap' ? 'roadmap' : 'interview prep'} has been exported to Notion.`,
      });
    } catch (error) {
      toast({
        title: 'Export Failed',
        description: error instanceof Error ? error.message : 'Failed to export to Notion.',
        variant: 'destructive',
      });
    } finally {
      setExporting(false);
    }
  };

  // Not connected state
  if (!status?.connected) {
    return (
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogTrigger asChild>
          <Button variant={variant} size={size} className={className}>
            <BookOpen className="w-4 h-4 mr-2" />
            Export to Notion
          </Button>
        </DialogTrigger>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <BookOpen className="w-5 h-5 text-primary" />
              Connect to Notion
            </DialogTitle>
            <DialogDescription>
              Export your {type === 'roadmap' ? 'learning roadmap' : 'interview preparation'} directly to your Notion workspace for easy tracking.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="bg-slate-50 p-4 rounded-lg space-y-2">
              <h4 className="font-semibold text-sm text-slate-900">What gets exported:</h4>
              <ul className="text-sm text-slate-600 space-y-1">
                {type === 'roadmap' ? (
                  <>
                    <li className="flex items-center gap-2">
                      <Check className="w-3 h-3 text-green-500" />
                      60-day learning milestones
                    </li>
                    <li className="flex items-center gap-2">
                      <Check className="w-3 h-3 text-green-500" />
                      Weekly tasks with checkboxes
                    </li>
                    <li className="flex items-center gap-2">
                      <Check className="w-3 h-3 text-green-500" />
                      Project suggestions
                    </li>
                    <li className="flex items-center gap-2">
                      <Check className="w-3 h-3 text-green-500" />
                      Resource links and hours estimates
                    </li>
                  </>
                ) : (
                  <>
                    <li className="flex items-center gap-2">
                      <Check className="w-3 h-3 text-green-500" />
                      All interview questions organized by type
                    </li>
                    <li className="flex items-center gap-2">
                      <Check className="w-3 h-3 text-green-500" />
                      Expected answers and hints
                    </li>
                    <li className="flex items-center gap-2">
                      <Check className="w-3 h-3 text-green-500" />
                      Progress checkboxes for practice
                    </li>
                    <li className="flex items-center gap-2">
                      <Check className="w-3 h-3 text-green-500" />
                      Notes section for each question
                    </li>
                  </>
                )}
              </ul>
            </div>
            <Button
              onClick={handleConnect}
              disabled={loading}
              className="w-full"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Connecting...
                </>
              ) : (
                <>
                  <BookOpen className="w-4 h-4 mr-2" />
                  Connect Notion Workspace
                </>
              )}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  // Connected state - show export button
  return (
    <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
      <DialogTrigger asChild>
        <Button variant={variant} size={size} className={className}>
          <BookOpen className="w-4 h-4 mr-2" />
          Export to Notion
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <BookOpen className="w-5 h-5 text-primary" />
            Export to Notion
          </DialogTitle>
          <DialogDescription>
            Connected to: <span className="font-medium">{status.workspaceName}</span>
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {exportedUrl ? (
            <div className="bg-green-50 border border-green-200 p-4 rounded-lg">
              <p className="text-green-800 font-medium mb-2">Export successful!</p>
              <a
                href={exportedUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-primary hover:underline flex items-center gap-1 text-sm"
              >
                Open in Notion <ExternalLink className="w-3 h-3" />
              </a>
            </div>
          ) : (
            <div className="bg-slate-50 p-4 rounded-lg">
              <p className="text-sm text-slate-600 mb-2">
                Ready to export your {type === 'roadmap' ? '60-day roadmap' : 'interview preparation sheet'} to{' '}
                <span className="font-medium">{status.workspaceName}</span>.
              </p>
            </div>
          )}

          <div className="flex gap-2">
            <Button
              onClick={handleExport}
              disabled={exporting}
              className="flex-1"
            >
              {exporting ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Exporting...
                </>
              ) : (
                <>
                  <FileText className="w-4 h-4 mr-2" />
                  Export Now
                </>
              )}
            </Button>
            <Button
              variant="outline"
              onClick={() => setDialogOpen(false)}
            >
              Cancel
            </Button>
          </div>

          <div className="pt-2 border-t">
            <Button
              variant="ghost"
              size="sm"
              onClick={handleDisconnect}
              disabled={loading}
              className="w-full text-slate-500 hover:text-red-600"
            >
              Disconnect Notion
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
