import React, { useRef, useEffect, useState } from 'react';
import { 
  X, Download, Share2, Copy, Check, FileText, 
  Sparkles, Award, ShieldAlert, Pill, ExternalLink, Image as ImageIcon
} from 'lucide-react';
import { logAnalyticsEvent } from '../firebase';

export default function DischargeCardModal({
  isOpen,
  onClose,
  target,
  guesses = [],
  won,
  isPractice,
  dateStr,
  profile,
  progression,
  stats,
  theme = 'dark'
}) {
  const canvasRef = useRef(null);
  const [imageUrl, setImageUrl] = useState('');
  const [imageBlob, setImageBlob] = useState(null);
  const [downloading, setDownloading] = useState(false);
  const [copiedImage, setCopiedImage] = useState(false);
  const [copiedText, setCopiedText] = useState(false);
  const [canShareFile, setCanShareFile] = useState(false);

  useEffect(() => {
    if (typeof navigator !== 'undefined' && navigator.canShare) {
      try {
        const testFile = new File([''], 'test.png', { type: 'image/png' });
        setCanShareFile(navigator.canShare({ files: [testFile] }));
      } catch (e) {
        setCanShareFile(false);
      }
    }
  }, []);

  // Draw the high-resolution discharge consult report on Canvas
  useEffect(() => {
    if (!isOpen || !target) return;

    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');

    // Canvas dimensions (2x for retina quality: 1000 x 1400)
    const W = 1000;
    const H = 1420;
    canvas.width = W;
    canvas.height = H;

    // Background: High-tech obsidian slate with subtle gradient
    const bgGradient = ctx.createLinearGradient(0, 0, W, H);
    bgGradient.addColorStop(0, '#0a0f1d');
    bgGradient.addColorStop(0.5, '#070b14');
    bgGradient.addColorStop(1, '#050811');
    ctx.fillStyle = bgGradient;
    ctx.fillRect(0, 0, W, H);

    // Decorative outer border
    ctx.strokeStyle = won ? '#10b98144' : '#ef444444';
    ctx.lineWidth = 4;
    ctx.strokeRect(20, 20, W - 40, H - 40);

    // Inner subtle glow accent lines
    ctx.strokeStyle = '#1e293b';
    ctx.lineWidth = 1;
    ctx.strokeRect(32, 32, W - 64, H - 64);

    // --- HEADER SECTION ---
    // Hospital / Laboratory Badge Top Banner
    ctx.fillStyle = '#0f172a';
    ctx.fillRect(40, 40, W - 80, 110);
    ctx.strokeStyle = '#1e293b';
    ctx.strokeRect(40, 40, W - 80, 110);

    // Green/Amber status indicator dot
    ctx.fillStyle = won ? '#10b981' : '#f43f5e';
    ctx.beginPath();
    ctx.arc(75, 95, 12, 0, Math.PI * 2);
    ctx.fill();

    // Hospital / Brand Name
    ctx.font = 'bold 32px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
    ctx.fillStyle = '#f8fafc';
    ctx.fillText('MICROBLEDLE CLINICAL LABS', 105, 88);

    ctx.font = 'bold 15px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
    ctx.fillStyle = '#10b981';
    ctx.fillText('DIVISION OF CLINICAL MICROBIOLOGY & ANTIMICROBIAL STEWARDSHIP', 105, 115);

    // Case Reference top right
    ctx.textAlign = 'right';
    ctx.font = 'bold 16px monospace';
    ctx.fillStyle = '#94a3b8';
    ctx.fillText(isPractice ? 'RUN: PRACTICE WARD' : `CASE RECORD #${dateStr}`, W - 65, 88);
    ctx.font = '13px monospace';
    ctx.fillStyle = '#64748b';
    ctx.fillText(`STATUS: ${won ? 'DISCHARGED / CURED' : 'UNRESOLVED / REVIEW'}`, W - 65, 115);
    ctx.textAlign = 'left';

    // --- PHYSICIAN PROFILE SECTION ---
    ctx.fillStyle = '#111827';
    ctx.fillRect(40, 170, W - 80, 100);
    ctx.strokeStyle = '#1f2937';
    ctx.strokeRect(40, 170, W - 80, 100);

    // Physician info
    ctx.font = 'bold 22px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
    ctx.fillStyle = '#f1f5f9';
    const docName = profile?.displayName ? `Dr. ${profile.displayName}` : 'Attending Physician';
    ctx.fillText(docName, 65, 212);

    ctx.font = '15px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
    ctx.fillStyle = '#94a3b8';
    const rankTitle = progression?.title || profile?.status || 'Resident Physician';
    const levelStr = progression?.level ? ` • Level ${progression.level}` : '';
    ctx.fillText(`${rankTitle}${levelStr}`, 65, 242);

    // Outcome Badge (Right side of profile)
    const badgeW = 320;
    const badgeH = 54;
    const badgeX = W - 65 - badgeW;
    const badgeY = 193;

    ctx.fillStyle = won ? 'rgba(16, 185, 129, 0.15)' : 'rgba(239, 68, 68, 0.15)';
    ctx.strokeStyle = won ? '#10b981' : '#ef4444';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.roundRect(badgeX, badgeY, badgeW, badgeH, 12);
    ctx.fill();
    ctx.stroke();

    ctx.textAlign = 'center';
    ctx.font = 'bold 18px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
    ctx.fillStyle = won ? '#34d399' : '#f87171';
    const outcomeText = won 
      ? `DIAGNOSIS CONFIRMED (${guesses.length}/6)` 
      : 'DIAGNOSIS FAILED (6/6)';
    ctx.fillText(outcomeText, badgeX + badgeW / 2, badgeY + 34);
    ctx.textAlign = 'left';

    // --- DIAGNOSTIC MATRIX GRID SECTION ---
    const gridStartY = 295;
    ctx.font = 'bold 14px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
    ctx.fillStyle = '#94a3b8';
    ctx.fillText('DIAGNOSTIC WORKUP MATRIX (TRAJECTORY TO CONVERGENCE)', 45, gridStartY);

    // Column Headers
    const colHeaders = ['TAXONOMY', 'MORPHOLOGY', 'RESPIRATION', 'KEY TEST', 'TROPISM'];
    const colW = 176;
    const colGap = 10;
    const gridLeft = 40;
    const headerY = gridStartY + 15;

    ctx.fillStyle = '#1e293b';
    ctx.fillRect(gridLeft, headerY, W - 80, 32);
    ctx.strokeStyle = '#334155';
    ctx.strokeRect(gridLeft, headerY, W - 80, 32);

    colHeaders.forEach((col, idx) => {
      const cx = gridLeft + idx * (colW + colGap) + colW / 2;
      ctx.textAlign = 'center';
      ctx.font = 'bold 12px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
      ctx.fillStyle = '#94a3b8';
      ctx.fillText(col, cx, headerY + 21);
    });

    // Rows of Guesses (up to 6)
    const rowStartY = headerY + 40;
    const rowH = 68;
    const rowGap = 8;

    for (let r = 0; r < 6; r++) {
      const currentY = rowStartY + r * (rowH + rowGap);
      const guessObj = guesses[r];

      if (guessObj) {
        const results = [
          guessObj.results.taxonomy,
          guessObj.results.morphology,
          guessObj.results.respiration,
          guessObj.results.keyTest,
          guessObj.results.tropism,
        ];

        results.forEach((res, cIdx) => {
          const tileX = gridLeft + cIdx * (colW + colGap);
          let fillColor = '#1e293b';
          let borderColor = '#334155';
          let textColor = '#cbd5e1';

          if (res.status === 'exact') {
            fillColor = '#059669';
            borderColor = '#10b981';
            textColor = '#ffffff';
          } else if (res.status === 'partial') {
            fillColor = '#d97706';
            borderColor = '#f59e0b';
            textColor = '#ffffff';
          }

          // Tile box
          ctx.fillStyle = fillColor;
          ctx.strokeStyle = borderColor;
          ctx.lineWidth = 1.5;
          ctx.beginPath();
          ctx.roundRect(tileX, currentY, colW, rowH, 10);
          ctx.fill();
          ctx.stroke();

          // Value inside tile
          ctx.textAlign = 'center';
          ctx.font = 'bold 13px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
          ctx.fillStyle = textColor;
          
          // Truncate text if needed
          const valText = String(res.guessValue || '');
          const words = valText.split(' ');
          if (words.length > 2 && valText.length > 15) {
            ctx.fillText(words.slice(0, 2).join(' '), tileX + colW / 2, currentY + 28);
            ctx.font = '11px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
            ctx.fillText(words.slice(2).join(' '), tileX + colW / 2, currentY + 46);
          } else {
            ctx.fillText(valText, tileX + colW / 2, currentY + 40);
          }
        });
      } else {
        // Empty row slot
        for (let cIdx = 0; cIdx < 5; cIdx++) {
          const tileX = gridLeft + cIdx * (colW + colGap);
          ctx.fillStyle = 'rgba(15, 23, 42, 0.4)';
          ctx.strokeStyle = '#1e293b';
          ctx.lineWidth = 1;
          ctx.beginPath();
          ctx.roundRect(tileX, currentY, colW, rowH, 8);
          ctx.fill();
          ctx.stroke();

          ctx.textAlign = 'center';
          ctx.font = 'bold 14px monospace';
          ctx.fillStyle = '#334155';
          ctx.fillText('—', tileX + colW / 2, currentY + 40);
        }
      }
    }

    // --- CLINICAL IDENTIFICATION SUMMARY ---
    const summaryY = 825;
    ctx.fillStyle = '#0f172a';
    ctx.fillRect(40, summaryY, W - 80, 220);
    ctx.strokeStyle = won ? '#10b98166' : '#ef444466';
    ctx.lineWidth = 2;
    ctx.strokeRect(40, summaryY, W - 80, 220);

    // Section title
    ctx.textAlign = 'left';
    ctx.font = 'bold 13px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
    ctx.fillStyle = '#10b981';
    ctx.fillText('MICROBIOLOGICAL SPECIMEN REPORT & TARGET DIAGNOSIS', 65, summaryY + 36);

    // Target Organism Name
    ctx.font = 'italic bold 32px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
    ctx.fillStyle = '#f8fafc';
    ctx.fillText(target.name, 65, summaryY + 75);

    // Common Name + Taxonomy
    ctx.font = '16px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
    ctx.fillStyle = '#94a3b8';
    ctx.fillText(`${target.commonName}  •  ${target.taxonomy}  •  ${target.morphology}`, 65, summaryY + 105);

    // Divider line
    ctx.strokeStyle = '#1e293b';
    ctx.beginPath();
    ctx.moveTo(65, summaryY + 125);
    ctx.lineTo(W - 65, summaryY + 125);
    ctx.stroke();

    // Rx Stewardship row
    ctx.font = 'bold 15px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
    ctx.fillStyle = '#38bdf8';
    ctx.fillText('💊 First-Line Empiric Antimicrobial Regimen:', 65, summaryY + 155);

    ctx.font = '15px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
    ctx.fillStyle = '#e2e8f0';
    ctx.fillText(target.firstLineRx, 65, summaryY + 180);

    // Culture row
    ctx.font = 'bold 14px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
    ctx.fillStyle = '#a78bfa';
    ctx.fillText('🧫 Key Culture / Diagnostic Confirmation:', 65, summaryY + 208);

    ctx.font = '14px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
    ctx.fillStyle = '#94a3b8';
    ctx.fillText(target.culture, 395, summaryY + 208);

    // --- STATISTICAL FOOTER ---
    const footerY = 1070;
    const statBoxW = 210;
    const statBoxH = 75;
    const statGap = 26;

    const statItems = [
      { label: 'CASES PLAYED', val: stats?.played || 1, color: '#f8fafc' },
      { label: 'WIN ACCURACY', val: `${stats?.played > 0 ? Math.round((stats.wins / stats.played) * 100) : 100}%`, color: '#34d399' },
      { label: 'ACTIVE STREAK', val: `${stats?.streak || 1} 🔥`, color: '#fbbf24' },
      { label: 'MAX STREAK', val: `${stats?.maxStreak || 1} ⚡`, color: '#38bdf8' }
    ];

    statItems.forEach((st, idx) => {
      const bx = 40 + idx * (statBoxW + statGap);
      ctx.fillStyle = '#111827';
      ctx.strokeStyle = '#1f2937';
      ctx.beginPath();
      ctx.roundRect(bx, footerY, statBoxW, statBoxH, 10);
      ctx.fill();
      ctx.stroke();

      ctx.textAlign = 'center';
      ctx.font = 'bold 24px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
      ctx.fillStyle = st.color;
      ctx.fillText(st.val, bx + statBoxW / 2, footerY + 38);

      ctx.font = 'bold 11px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
      ctx.fillStyle = '#64748b';
      ctx.fillText(st.label, bx + statBoxW / 2, footerY + 60);
    });

    // --- BRAND FOOTER & WATERMARK ---
    const brandY = 1200;
    ctx.fillStyle = '#080d1a';
    ctx.fillRect(40, brandY, W - 80, 160);
    ctx.strokeStyle = '#1e293b';
    ctx.strokeRect(40, brandY, W - 80, 160);

    ctx.textAlign = 'left';
    ctx.font = 'bold 20px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
    ctx.fillStyle = '#10b981';
    ctx.fillText('DAILY MEDICAL MICROBIOLOGY WORDLE • TEST YOUR CLINICAL DEDUCTION', 70, brandY + 50);

    ctx.font = '15px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
    ctx.fillStyle = '#94a3b8';
    ctx.fillText('Sharpen pathogen identification, Gram morphology, and empiric antimicrobial therapy.', 70, brandY + 80);

    ctx.font = 'bold 18px monospace';
    ctx.fillStyle = '#38bdf8';
    ctx.fillText('🔗 https://microbledle.com/', 70, brandY + 120);

    // Watermark seal on right
    ctx.textAlign = 'right';
    ctx.font = 'bold 13px monospace';
    ctx.fillStyle = '#475569';
    ctx.fillText('VERIFIED LAB RECORD', W - 70, brandY + 70);
    ctx.font = '11px monospace';
    ctx.fillStyle = '#334155';
    ctx.fillText(`HASH: MB-${Math.abs(dateStr.split('').reduce((a, b) => (a << 5) - a + b.charCodeAt(0), 0)).toString(16).toUpperCase()}`, W - 70, brandY + 95);
    ctx.fillText(new Date().toUTCString(), W - 70, brandY + 120);

    // Convert Canvas to Blob and Data URL for preview and sharing
    canvas.toBlob((blob) => {
      if (blob) {
        setImageBlob(blob);
        const url = URL.createObjectURL(blob);
        setImageUrl(url);
      }
    }, 'image/png', 0.95);

  }, [isOpen, target, guesses, won, isPractice, dateStr, profile, progression, stats]);

  if (!isOpen) return null;

  // 1. Download image file (.png)
  const handleDownload = () => {
    if (!canvasRef.current) return;
    logAnalyticsEvent('share_clicked', { type: 'discharge_card_download', mode: isPractice ? 'practice' : 'daily' });
    setDownloading(true);
    try {
      const fileName = `microbledle-discharge-${dateStr || 'case'}.png`;
      const canvas = canvasRef.current;
      const link = document.createElement('a');
      link.download = fileName;
      link.href = canvas.toDataURL('image/png');
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (err) {
      console.error('Download error:', err);
    } finally {
      setTimeout(() => setDownloading(false), 800);
    }
  };

  // 2. Share image directly via Web Share API
  const handleShare = async () => {
    if (!imageBlob) return;
    logAnalyticsEvent('share_clicked', { type: 'discharge_card_webshare', mode: isPractice ? 'practice' : 'daily' });
    const fileName = `microbledle-discharge-${dateStr || 'case'}.png`;
    const file = new File([imageBlob], fileName, { type: 'image/png' });

    if (navigator.canShare && navigator.canShare({ files: [file] })) {
      try {
        await navigator.share({
          files: [file],
          title: `Microbledle Clinical Case Report (${won ? `${guesses.length}/6 Solved` : 'Unsolved'})`,
          text: `Here is my clinical consult discharge report for Microbledle ${dateStr}! Can you deduce today's target pathogen?`
        });
      } catch (err) {
        if (err.name !== 'AbortError') {
          console.warn('Share error:', err);
        }
      }
    } else {
      // Fallback: download
      handleDownload();
    }
  };

  // 3. Copy image to system clipboard
  const handleCopyImage = async () => {
    if (!imageBlob || !navigator.clipboard || !window.ClipboardItem) return;
    logAnalyticsEvent('share_clicked', { type: 'discharge_card_clipboard', mode: isPractice ? 'practice' : 'daily' });
    try {
      await navigator.clipboard.write([
        new ClipboardItem({ 'image/png': imageBlob })
      ]);
      setCopiedImage(true);
      setTimeout(() => setCopiedImage(false), 2000);
    } catch (err) {
      console.warn('Clipboard image write failed:', err);
      handleDownload();
    }
  };

  // 4. Copy emoji text grid fallback
  const handleCopyTextGrid = () => {
    logAnalyticsEvent('share_clicked', { type: 'discharge_card_emoji_text', mode: isPractice ? 'practice' : 'daily' });
    const statusMap = { exact: '🟩', partial: '🟨', incorrect: '⬛' };
    const gridRows = guesses.map(g => {
      const { taxonomy, morphology, respiration, keyTest, tropism } = g.results;
      return `${statusMap[taxonomy.status]}${statusMap[morphology.status]}${statusMap[respiration.status]}${statusMap[keyTest.status]}${statusMap[tropism.status]}`;
    }).join('\n');

    const header = isPractice ? 'Microbledle (Practice)' : `Microbledle ${dateStr}`;
    const score = won ? `${guesses.length}/6` : 'X/6';
    const text = `${header} ${score}\n\n${gridRows}\n\nPlay at: https://microbledle.com/`;

    navigator.clipboard.writeText(text);
    setCopiedText(true);
    setTimeout(() => setCopiedText(false), 2200);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/85 backdrop-blur-md animate-fade">
      <div className="bg-slate-900 border border-slate-700/80 rounded-3xl p-4 sm:p-6 max-w-xl w-full shadow-2xl relative max-h-[95vh] flex flex-col">
        
        {/* Modal Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-800 shrink-0">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
              <FileText className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-black text-white flex items-center gap-2">
                Case Discharge Summary
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/20 border border-emerald-500/40 text-emerald-300">
                  Graphic Report
                </span>
              </h3>
              <p className="text-xs text-slate-400">Official Clinical Consult Export</p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="text-slate-400 hover:text-white p-1.5 rounded-lg hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Hidden off-screen canvas */}
        <canvas ref={canvasRef} className="hidden" />

        {/* Scrollable Card Preview */}
        <div className="flex-1 overflow-y-auto py-4 px-1 flex flex-col items-center">
          {imageUrl ? (
            <div className="relative rounded-2xl overflow-hidden border border-slate-700/80 shadow-2xl max-w-md w-full bg-slate-950">
              <img 
                src={imageUrl} 
                alt="Microbledle Clinical Consult Report" 
                className="w-full h-auto object-contain rounded-2xl select-none"
              />
            </div>
          ) : (
            <div className="h-64 flex flex-col items-center justify-center text-slate-400 text-sm gap-2">
              <Sparkles className="w-6 h-6 text-emerald-400 animate-spin" />
              Generating high-resolution report card...
            </div>
          )}
        </div>

        {/* Action Buttons */}
        <div className="pt-3 border-t border-slate-800 flex flex-col gap-2 shrink-0">
          <div className="grid grid-cols-2 gap-2">
            {/* Primary Download Button */}
            <button
              onClick={handleDownload}
              disabled={!imageUrl || downloading}
              className="py-3 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-500 font-bold text-white text-sm flex items-center justify-center gap-2 transition shadow-lg shadow-emerald-950/50 active:scale-[0.98] disabled:opacity-50"
            >
              {downloading ? (
                <>
                  <Check className="w-4 h-4 text-white" />
                  Saving...
                </>
              ) : (
                <>
                  <Download className="w-4 h-4" />
                  Download PNG
                </>
              )}
            </button>

            {/* Native Share Button (Mobile / Supported Browsers) */}
            {canShareFile ? (
              <button
                onClick={handleShare}
                disabled={!imageUrl}
                className="py-3 px-4 rounded-xl bg-cyan-600 hover:bg-cyan-500 font-bold text-white text-sm flex items-center justify-center gap-2 transition shadow-lg shadow-cyan-950/50 active:scale-[0.98] disabled:opacity-50"
              >
                <Share2 className="w-4 h-4" />
                Share Report
              </button>
            ) : (
              <button
                onClick={handleCopyImage}
                disabled={!imageUrl}
                className="py-3 px-4 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 font-bold text-slate-200 text-sm flex items-center justify-center gap-2 transition active:scale-[0.98] disabled:opacity-50"
              >
                {copiedImage ? (
                  <>
                    <Check className="w-4 h-4 text-emerald-400" />
                    Copied Image!
                  </>
                ) : (
                  <>
                    <Copy className="w-4 h-4 text-slate-400" />
                    Copy Image
                  </>
                )}
              </button>
            )}
          </div>

          <div className="flex items-center justify-between gap-2 pt-1">
            {/* Copy Emoji Grid button */}
            <button
              onClick={handleCopyTextGrid}
              className="text-xs text-slate-400 hover:text-slate-200 py-1.5 px-3 rounded-lg hover:bg-slate-800/80 transition flex items-center gap-1.5 font-medium"
            >
              {copiedText ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Copied Text Grid!</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5" />
                  <span>Copy Emoji Text</span>
                </>
              )}
            </button>

            <button
              onClick={onClose}
              className="text-xs text-slate-400 hover:text-white py-1.5 px-3 rounded-lg hover:bg-slate-800/80 transition"
            >
              Close
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}
