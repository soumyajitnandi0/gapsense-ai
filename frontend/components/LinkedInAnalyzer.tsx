'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Loader2, Linkedin, CheckCircle, AlertCircle, TrendingUp, MessageSquare, ThumbsUp, Share2, Lightbulb } from 'lucide-react';
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
  connectLinkedIn,
  disconnectLinkedIn,
  getLinkedInStatus,
  getLinkedInFullAnalysis,
  LinkedInStatus,
  LinkedInFullAnalysis,
} from '@/lib/linkedinApi';

interface LinkedInAnalyzerProps {
  variant?: 'default' | 'outline' | 'ghost';
  size?: 'default' | 'sm' | 'lg';
  className?: string;
}

export default function LinkedInAnalyzer({
  variant = 'outline',
  size = 'default',
  className = '',
}: LinkedInAnalyzerProps) {
  const { toast } = useToast();
  const [status, setStatus] = useState<LinkedInStatus | null>(null);
  const [analysis, setAnalysis] = useState<LinkedInFullAnalysis | null>(null);
  const [loading, setLoading] = useState(false);
  const [analyzing, setAnalyzing] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);

  useEffect(() => {
    checkStatus();
  }, []);

  const checkStatus = async () => {
    try {
      const data = await getLinkedInStatus();
      setStatus(data);
    } catch (error) {
      console.error('Failed to check LinkedIn status:', error);
    }
  };

  const handleConnect = async () => {
    setLoading(true);
    try {
      const { url } = await connectLinkedIn();
      window.location.href = url;
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to connect to LinkedIn. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDisconnect = async () => {
    setLoading(true);
    try {
      await disconnectLinkedIn();
      setStatus({ connected: false });
      setAnalysis(null);
      toast({
        title: 'Disconnected',
        description: 'LinkedIn account disconnected successfully.',
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to disconnect LinkedIn.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleAnalyze = async () => {
    setAnalyzing(true);
    try {
      const data = await getLinkedInFullAnalysis();
      setAnalysis(data);
      toast({
        title: 'Analysis Complete',
        description: 'Your LinkedIn profile and posts have been analyzed.',
      });
    } catch (error) {
      toast({
        title: 'Analysis Failed',
        description: 'Failed to analyze LinkedIn data. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setAnalyzing(false);
    }
  };

  // Not connected state
  if (!status?.connected) {
    return (
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogTrigger asChild>
          <Button variant={variant} size={size} className={className}>
            <Linkedin className="w-4 h-4 mr-2" />
            Analyze LinkedIn
          </Button>
        </DialogTrigger>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Linkedin className="w-5 h-5 text-[#0A66C2]" />
              Connect LinkedIn
            </DialogTitle>
            <DialogDescription>
              Connect your LinkedIn account to analyze your profile completeness and get AI-powered suggestions for improvement.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="bg-slate-50 p-4 rounded-lg space-y-2">
              <h4 className="font-semibold text-sm text-slate-900">What you&apos;ll get:</h4>
              <ul className="text-sm text-slate-600 space-y-1">
                <li className="flex items-center gap-2">
                  <CheckCircle className="w-3 h-3 text-green-500" />
                  Profile completeness score
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="w-3 h-3 text-green-500" />
                  Keyword optimization analysis
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="w-3 h-3 text-green-500" />
                  Content performance insights
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="w-3 h-3 text-green-500" />
                  AI-powered improvement suggestions
                </li>
              </ul>
            </div>
            <Button
              onClick={handleConnect}
              disabled={loading}
              className="w-full bg-[#0A66C2] hover:bg-[#0A66C2]/90"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Connecting...
                </>
              ) : (
                <>
                  <Linkedin className="w-4 h-4 mr-2" />
                  Connect LinkedIn
                </>
              )}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  // Connected state - show analysis button
  return (
    <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
      <DialogTrigger asChild>
        <Button variant={variant} size={size} className={className}>
          <Linkedin className="w-4 h-4 mr-2" />
          Analyze LinkedIn
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-3xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Linkedin className="w-5 h-5 text-[#0A66C2]" />
            LinkedIn Analysis
          </DialogTitle>
          <DialogDescription>
            AI-powered analysis of your LinkedIn profile and posts
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {!analysis ? (
            <div className="text-center py-8">
              <Linkedin className="w-12 h-12 text-[#0A66C2] mx-auto mb-4" />
              <p className="text-slate-600 mb-4">
                Ready to analyze your LinkedIn profile and posts
              </p>
              <Button
                onClick={handleAnalyze}
                disabled={analyzing}
                className="bg-[#0A66C2] hover:bg-[#0A66C2]/90"
              >
                {analyzing ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Analyzing...
                  </>
                ) : (
                  <>
                    <TrendingUp className="w-4 h-4 mr-2" />
                    Start Analysis
                  </>
                )}
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              {/* Profile Completeness */}
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-lg flex items-center gap-2">
                    Profile Completeness
                    <Badge variant={analysis.profile.completeness.score >= 80 ? 'default' : analysis.profile.completeness.score >= 50 ? 'secondary' : 'destructive'}>
                      {analysis.profile.completeness.score}%
                    </Badge>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <Progress value={analysis.profile.completeness.score} className="h-2" />
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    <div className="flex items-center gap-2">
                      {analysis.profile.completeness.hasHeadline ? (
                        <CheckCircle className="w-4 h-4 text-green-500" />
                      ) : (
                        <AlertCircle className="w-4 h-4 text-amber-500" />
                      )}
                      <span className={analysis.profile.completeness.hasHeadline ? 'text-slate-700' : 'text-slate-500'}>Headline</span>
                    </div>
                    <div className="flex items-center gap-2">
                      {analysis.profile.completeness.hasSummary ? (
                        <CheckCircle className="w-4 h-4 text-green-500" />
                      ) : (
                        <AlertCircle className="w-4 h-4 text-amber-500" />
                      )}
                      <span className={analysis.profile.completeness.hasSummary ? 'text-slate-700' : 'text-slate-500'}>Summary</span>
                    </div>
                    <div className="flex items-center gap-2">
                      {analysis.profile.completeness.hasExperience ? (
                        <CheckCircle className="w-4 h-4 text-green-500" />
                      ) : (
                        <AlertCircle className="w-4 h-4 text-amber-500" />
                      )}
                      <span className={analysis.profile.completeness.hasExperience ? 'text-slate-700' : 'text-slate-500'}>Experience</span>
                    </div>
                    <div className="flex items-center gap-2">
                      {analysis.profile.completeness.hasSkills ? (
                        <CheckCircle className="w-4 h-4 text-green-500" />
                      ) : (
                        <AlertCircle className="w-4 h-4 text-amber-500" />
                      )}
                      <span className={analysis.profile.completeness.hasSkills ? 'text-slate-700' : 'text-slate-500'}>Skills ({analysis.profile.profile?.skills?.length || 0})</span>
                    </div>
                  </div>
                  {analysis.profile.completeness.recommendations.length > 0 && (
                    <div className="bg-amber-50 p-3 rounded-lg text-sm">
                      <p className="font-semibold text-amber-800 mb-1">Recommendations:</p>
                      <ul className="space-y-1">
                        {analysis.profile.completeness.recommendations.slice(0, 2).map((rec, i) => (
                          <li key={i} className="text-amber-700 flex items-start gap-1">
                            <AlertCircle className="w-3 h-3 mt-0.5 shrink-0" />
                            {rec}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Keyword Optimization */}
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-lg">Keyword Optimization</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-wrap gap-2 mb-3">
                    {analysis.profile.keywordOptimization.found.slice(0, 8).map((keyword) => (
                      <Badge key={keyword} variant="default" className="bg-green-100 text-green-800 hover:bg-green-100">
                        {keyword}
                      </Badge>
                    ))}
                    {analysis.profile.keywordOptimization.missing.slice(0, 5).map((keyword) => (
                      <Badge key={keyword} variant="outline" className="text-slate-400">
                        {keyword}
                      </Badge>
                    ))}
                  </div>
                  {analysis.profile.keywordOptimization.suggestions.length > 0 && (
                    <p className="text-sm text-slate-600 flex items-start gap-2">
                      <Lightbulb className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
                      {analysis.profile.keywordOptimization.suggestions[0]}
                    </p>
                  )}
                </CardContent>
              </Card>

              {/* Posts Analysis */}
              {analysis.posts.totalPosts > 0 && (
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-lg flex items-center gap-2">
                      Posts Analysis
                      <Badge variant="secondary">{analysis.posts.totalPosts} posts</Badge>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-3 gap-4">
                      <div className="text-center p-3 bg-slate-50 rounded-lg">
                        <ThumbsUp className="w-5 h-5 text-slate-600 mx-auto mb-1" />
                        <p className="text-lg font-semibold">{analysis.posts.averageEngagement.likes}</p>
                        <p className="text-xs text-slate-500">Avg Likes</p>
                      </div>
                      <div className="text-center p-3 bg-slate-50 rounded-lg">
                        <MessageSquare className="w-5 h-5 text-slate-600 mx-auto mb-1" />
                        <p className="text-lg font-semibold">{analysis.posts.averageEngagement.comments}</p>
                        <p className="text-xs text-slate-500">Avg Comments</p>
                      </div>
                      <div className="text-center p-3 bg-slate-50 rounded-lg">
                        <Share2 className="w-5 h-5 text-slate-600 mx-auto mb-1" />
                        <p className="text-lg font-semibold">{analysis.posts.averageEngagement.shares}</p>
                        <p className="text-xs text-slate-500">Avg Shares</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <span className="text-slate-600">Engagement trend:</span>
                      <Badge variant={analysis.posts.engagementTrend === 'increasing' ? 'default' : analysis.posts.engagementTrend === 'decreasing' ? 'destructive' : 'secondary'}>
                        {analysis.posts.engagementTrend === 'increasing' ? '📈 Increasing' : analysis.posts.engagementTrend === 'decreasing' ? '📉 Decreasing' : '➡️ Stable'}
                      </Badge>
                    </div>
                    {analysis.posts.contentSuggestions.length > 0 && (
                      <div className="bg-blue-50 p-3 rounded-lg">
                        <p className="font-semibold text-blue-800 mb-2 text-sm flex items-center gap-2">
                          <Lightbulb className="w-4 h-4" />
                          Content Suggestions
                        </p>
                        <ul className="space-y-1">
                          {analysis.posts.contentSuggestions.slice(0, 3).map((suggestion, i) => (
                            <li key={i} className="text-sm text-blue-700 flex items-start gap-2">
                              <span className="text-blue-400">•</span>
                              {suggestion}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </CardContent>
                </Card>
              )}

              {/* Actions */}
              <div className="flex gap-2 pt-2">
                <Button
                  onClick={handleAnalyze}
                  disabled={analyzing}
                  variant="outline"
                  className="flex-1"
                >
                  {analyzing ? (
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  ) : (
                    <TrendingUp className="w-4 h-4 mr-2" />
                  )}
                  Refresh Analysis
                </Button>
                <Button
                  variant="ghost"
                  onClick={handleDisconnect}
                  disabled={loading}
                  className="text-slate-500 hover:text-red-600"
                >
                  Disconnect
                </Button>
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
