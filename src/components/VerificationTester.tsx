import { useState, useMemo } from 'react';
import { Shield, ExternalLink, Copy, Check } from 'lucide-react';
import { cn } from '@/utils/cn';

interface VerificationTesterProps {
  webhookUrl: string;
  verifyToken: string;
}

export function VerificationTester({ webhookUrl, verifyToken }: VerificationTesterProps) {
  const [result, setResult] = useState<{
    loading: boolean;
    success?: boolean;
    status?: number;
    responseText?: string;
    url?: string;
    error?: string;
  }>({ loading: false });
  const [copied, setCopied] = useState(false);

  const url = useMemo<string | null>(() => {
    try {
      const u = new URL(webhookUrl || 'http://localhost:3000/webhook');
      u.searchParams.set('hub.mode', 'subscribe');
      u.searchParams.set('hub.verify_token', verifyToken || 'test_token');
      u.searchParams.set('hub.challenge', '1158201444');
      return u.toString();
    } catch {
      return null;
    }
  }, [webhookUrl, verifyToken]);

  const handleTest = async () => {
    if (!webhookUrl) {
      setResult({ loading: false, error: 'Please configure webhook URL in settings first' });
      return;
    }

    if (!url) return;

    setResult({ loading: true });

    try {
      const response = await fetch(url, { method: 'GET' });
      const text = await response.text();
      setResult({
        loading: false,
        success: response.ok && text === '1158201444',
        status: response.status,
        responseText: text,
        url,
      });
    } catch (err) {
      setResult({
        loading: false,
        error: err instanceof Error ? err.message : 'Failed to connect',
      });
    }
  };

  const handleCopy = async () => {
    if (!url) return;
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      setResult({ loading: false, error: 'Could not copy to clipboard' });
    }
  };

  return (
    <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
      <div className="flex items-center gap-2 mb-3">
        <Shield size={16} className="text-whatsapp-green" />
        <h3 className="text-sm font-semibold text-gray-700">Webhook Verification Test</h3>
      </div>

      <p className="text-xs text-gray-500 mb-3">
        Tests GET /webhook with hub.mode=subscribe, hub.verify_token, and hub.challenge
      </p>

      <div className="flex gap-2 mb-3">
        <button
          onClick={handleTest}
          disabled={result.loading || !url}
          className={cn(
            'flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors',
            result.loading || !url
              ? 'bg-gray-200 text-gray-500 cursor-not-allowed'
              : 'bg-whatsapp-green text-white hover:bg-whatsapp-green-dark',
          )}
        >
          {result.loading ? 'Testing...' : 'Test Verification'}
        </button>

        <button
          onClick={handleCopy}
          disabled={!url}
          className={cn(
            'flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium border transition-colors',
            !url
              ? 'border-gray-200 text-gray-400 cursor-not-allowed'
              : 'border-gray-200 hover:bg-gray-100 text-gray-600',
          )}
        >
          {copied ? <Check size={14} /> : <Copy size={14} />}
          {copied ? 'Copied' : 'Copy URL'}
        </button>
      </div>

      {webhookUrl && !url && (
        <p className="text-xs text-red-600 mb-3">Invalid webhook URL.</p>
      )}

      {result.url && (
        <div className="mb-3 p-2 bg-white rounded border border-gray-200">
          <p className="text-[11px] text-gray-400 mb-1">Request URL:</p>
          <a
            href={result.url}
            target="_blank"
            rel="noopener noreferrer"
            className="text-xs text-blue-600 break-all flex items-center gap-1 hover:underline"
          >
            {result.url}
            <ExternalLink size={10} />
          </a>
        </div>
      )}

      {result.error && (
        <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">
          {result.error}
        </div>
      )}

      {result.success !== undefined && !result.error && (
        <div className={cn(
          'p-3 rounded-lg border text-sm',
          result.success
            ? 'bg-green-50 border-green-200 text-green-700'
            : 'bg-yellow-50 border-yellow-200 text-yellow-700',
        )}>
          <p className="font-medium mb-1">
            {result.success ? '✅ Verification Successful' : '⚠️ Verification Failed'}
          </p>
          <p className="text-xs opacity-80">Status: {result.status}</p>
          <p className="text-xs opacity-80">Response: {result.responseText}</p>
        </div>
      )}
    </div>
  );
}
