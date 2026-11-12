import { useState } from 'react';
import { EmailNotification } from '../types/hotel';
import { X, Mail, FileText, Check, ExternalLink, ShieldCheck, Download, Copy, Calendar, Clock } from 'lucide-react';

interface EmailPreviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  email: EmailNotification | null;
}

export default function EmailPreviewModal({ isOpen, onClose, email }: EmailPreviewModalProps) {
  const [copiedLink, setCopiedLink] = useState(false);

  if (!isOpen || !email) return null;

  const handleCopyPdfLink = () => {
    const fullUrl = `${window.location.origin}${email.pdfSummaryUrl}`;
    navigator.clipboard.writeText(fullUrl).then(() => {
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2000);
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/80 backdrop-blur-md overflow-y-auto animate-in fade-in duration-200">
      <div className="bg-white dark:bg-slate-900 rounded-2xl w-full max-w-3xl my-6 border border-slate-200 dark:border-slate-800 shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Email Header Bar */}
        <div className="px-6 py-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between bg-slate-50 dark:bg-slate-950/70">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-amber-400/20 text-amber-600 dark:text-amber-400 flex items-center justify-center">
              <Mail className="w-4 h-4" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold uppercase tracking-wider text-amber-600 dark:text-amber-400">
                  Simulated Email Delivery
                </span>
                <span className="text-slate-300 dark:text-slate-700">·</span>
                <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/50 px-2 py-0.5 rounded-sm">
                  <ShieldCheck className="w-3 h-3" /> TLS Verified Delivered
                </span>
              </div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-white truncate max-w-md">
                {email.subject}
              </h3>
            </div>
          </div>
          <button
            onClick={onClose}
            type="button"
            className="p-1.5 text-slate-400 hover:text-slate-900 dark:hover:text-white rounded-lg transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Email Metadata Strip */}
        <div className="px-6 py-3 bg-slate-100/60 dark:bg-slate-800/40 border-b border-slate-200 dark:border-slate-800 text-xs space-y-1">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div className="flex items-center gap-2 text-slate-600 dark:text-slate-400">
              <span className="font-semibold text-slate-800 dark:text-slate-200">From:</span>
              <span>{email.senderName} &lt;{email.senderEmail}&gt;</span>
            </div>
            <div className="flex items-center gap-1.5 text-slate-500 text-[11px]">
              <Clock className="w-3 h-3" />
              <span>{email.sentAt}</span>
            </div>
          </div>
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div className="flex items-center gap-2 text-slate-600 dark:text-slate-400">
              <span className="font-semibold text-slate-800 dark:text-slate-200">To:</span>
              <span>{email.recipientName} &lt;{email.recipientEmail}&gt;</span>
            </div>
            <div className="text-[10px] font-mono text-slate-400">
              ID: {email.messageId}
            </div>
          </div>
        </div>

        {/* PDF Link CTA Ribbon */}
        <div className="bg-amber-500/10 dark:bg-amber-400/10 border-b border-amber-200 dark:border-amber-800/60 px-6 py-3 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <FileText className="w-5 h-5 text-amber-600 dark:text-amber-400 shrink-0" />
            <div>
              <p className="text-xs font-bold text-slate-900 dark:text-white">
                Official Reservation PDF Summary Attachment
              </p>
              <p className="text-[11px] text-slate-500 dark:text-slate-400">
                Printable voucher with barcode, tax invoice, and driving directions.
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2 w-full sm:w-auto">
            <button
              type="button"
              onClick={handleCopyPdfLink}
              className="px-3 py-1.5 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 text-xs font-semibold rounded-lg border border-slate-300 dark:border-slate-700 hover:bg-slate-50 flex items-center gap-1.5 cursor-pointer"
            >
              {copiedLink ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copiedLink ? 'Copied' : 'Copy Link'}</span>
            </button>
            <a
              href={email.pdfSummaryUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="px-3 py-1.5 bg-amber-400 hover:bg-amber-300 text-slate-950 text-xs font-bold rounded-lg shadow-xs flex items-center gap-1.5 cursor-pointer"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Open PDF Voucher</span>
              <ExternalLink className="w-3 h-3 opacity-70" />
            </a>
          </div>
        </div>

        {/* Sandboxed HTML Email Body Preview */}
        <div className="p-4 sm:p-6 overflow-y-auto flex-1 bg-slate-100 dark:bg-slate-950">
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 max-w-xl mx-auto overflow-hidden">
            <iframe
              title="Booking Confirmation Email Preview"
              srcDoc={email.htmlContent}
              className="w-full h-[480px] border-none"
              sandbox="allow-same-origin allow-popups allow-popups-to-escape-sandbox"
            />
          </div>
        </div>

        {/* Footer actions */}
        <div className="px-6 py-3 border-t border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/60 flex items-center justify-between text-xs text-slate-500">
          <span>YashDeep Palace Automated Notification Engine</span>
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 bg-slate-200 dark:bg-slate-800 hover:bg-slate-300 dark:hover:bg-slate-700 text-slate-800 dark:text-white font-semibold rounded-lg transition-colors cursor-pointer"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
}
