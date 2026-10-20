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

  // Draw modern, clean report card on Canvas
  useEffect(() => {
    if (!isOpen || !target) return;

    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');

    // Canvas dimensions (Retina quality 920 x 1180)
    const W = 920;
    const H = 1180;
    canvas.width = W;
    canvas.height = H;

    // Background: Smooth dark obsidian slate gradient
    const bgGradient = ctx.createLinearGradient(0, 0, W, H);
    bgGradient.addColorStop(0, '#0c1322');
    bgGradient.addColorStop(0.5, '#080d18');
    bgGradient.addColorStop(1, '#050811');
    ctx.fillStyle = bgGradient;
    ctx.fillRect(0, 0, W, H);

    // Decorative outer card border
    ctx.strokeStyle = won ? 'rgba(16, 185, 129, 0.4)' : 'rgba(239, 68, 68, 0.4)';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.roundRect(16, 16, W - 32, H - 32, 24);
    ctx.stroke();

    const contentLeft = 40;
    const contentW = W - 80; // 840px

    // --- 1. HEADER SECTION ---
    // Microbledle Logo & Title
    ctx.textAlign = 'left';
    ctx.font = '900 34px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
    ctx.fillStyle = '#10b981';
    ctx.fillText('MICROBLEDLE', contentLeft, 68);

    ctx.font = '600 15px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
    ctx.fillStyle = '#94a3b8';
    ctx.fillText('Daily Medical Microbiology Game', contentLeft, 94);

    // Date / Mode Pill on Right
    const modeLabel = isPractice ? 'PRACTICE MODE' : `DAILY • ${dateStr}`;
    ctx.font = 'bold 13px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
    const pillTextW = ctx.measureText(modeLabel).width;
    const pillW = pillTextW + 28;
    const pillH = 34;
    const pillX = W - contentLeft - pillW;
    const pillY = 56;

    ctx.fillStyle = '#1e293b';
    ctx.strokeStyle = '#334155';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.roundRect(pillX, pillY, pillW, pillH, 10);
    ctx.fill();
    ctx.stroke();

    ctx.textAlign = 'center';
    ctx.fillStyle = '#38bdf8';
    ctx.fillText(modeLabel, pillX + pillW / 2, pillY + 22);

    // --- 2. PLAYER & OUTCOME BAR ---
    const playerBarY = 120;
    const playerBarH = 72;
    ctx.fillStyle = '#0f172a';
    ctx.strokeStyle = '#1e293b';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.roundRect(contentLeft, playerBarY, contentW, playerBarH, 16);
    ctx.fill();
    ctx.stroke();

    // Doctor Name & Level
    ctx.textAlign = 'left';
    ctx.font = 'bold 20px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
    const docName = profile?.displayName 
      ? (profile.displayName.startsWith('Dr.') ? profile.displayName : `Dr. ${profile.displayName}`) 
      : 'Doctor';
    ctx.fillText(docName, contentLeft + 20, playerBarY + 33);

    ctx.font = '13px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
    ctx.fillStyle = '#94a3b8';
    const rankTitle = progression?.title || profile?.status || 'Resident Physician';
    const levelStr = progression?.level ? ` • Level ${progression.level}` : '';
    ctx.fillText(`${rankTitle}${levelStr}`, contentLeft + 20, playerBarY + 54);

    // Outcome Badge (Right)
    const outcomeW = 220;
    const outcomeH = 44;
    const outcomeX = contentLeft + contentW - outcomeW - 14;
    const outcomeY = playerBarY + 14;

    ctx.fillStyle = won ? 'rgba(16, 185, 129, 0.18)' : 'rgba(239, 68, 68, 0.18)';
    ctx.strokeStyle = won ? '#10b981' : '#ef4444';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.roundRect(outcomeX, outcomeY, outcomeW, outcomeH, 12);
    ctx.fill();
    ctx.stroke();

    ctx.textAlign = 'center';
    ctx.font = 'bold 15px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
    ctx.fillStyle = won ? '#34d399' : '#f87171';
    const outcomeText = won ? `SOLVED IN ${guesses.length}/6 🏆` : 'UNSOLVED (6/6)';
    ctx.fillText(outcomeText, outcomeX + outcomeW / 2, outcomeY + 27);

    // --- 3. GUESS HISTORY MATRIX ---
    const gridStartY = 212;
    ctx.textAlign = 'left';
    ctx.font = 'bold 12px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
    ctx.fillStyle = '#64748b';
    ctx.fillText('YOUR GUESSES', contentLeft, gridStartY);

    // Column Headers
    const colHeaders = ['GROUP', 'SHAPE', 'OXYGEN', 'KEY TEST', 'SITE'];
    const colW = 160;
    const colGap = 10;
    const headerY = gridStartY + 10;

    ctx.fillStyle = '#1e293b';
    ctx.fillRect(contentLeft, headerY, contentW, 28);
    ctx.strokeStyle = '#334155';
    ctx.strokeRect(contentLeft, headerY, contentW, 28);

    colHeaders.forEach((col, idx) => {
      const cx = contentLeft + idx * (colW + colGap) + colW / 2;
      ctx.textAlign = 'center';
      ctx.font = 'bold 11px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
      ctx.fillStyle = '#94a3b8';
      ctx.fillText(col, cx, headerY + 18);
    });

    // 6 Guess Rows
    const rowStartY = headerY + 34;
    const rowH = 50;
    const rowGap = 6;

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
          const tileX = contentLeft + cIdx * (colW + colGap);
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
          ctx.roundRect(tileX, currentY, colW, rowH, 8);
          ctx.fill();
          ctx.stroke();

          // Value inside tile
          ctx.textAlign = 'center';
          ctx.font = 'bold 12px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
          ctx.fillStyle = textColor;
          
          const valText = String(res.guessValue || '');
          const words = valText.split(' ');
          if (words.length > 2 && valText.length > 14) {
            ctx.fillText(words.slice(0, 2).join(' '), tileX + colW / 2, currentY + 20);
            ctx.font = '10px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
            ctx.fillText(words.slice(2).join(' '), tileX + colW / 2, currentY + 36);
          } else {
            ctx.fillText(valText, tileX + colW / 2, currentY + 30);
          }
        });
      } else {
        // Empty row slot
        for (let cIdx = 0; cIdx < 5; cIdx++) {
          const tileX = contentLeft + cIdx * (colW + colGap);
          ctx.fillStyle = 'rgba(15, 23, 42, 0.4)';
          ctx.strokeStyle = '#1e293b';
          ctx.lineWidth = 1;
          ctx.beginPath();
          ctx.roundRect(tileX, currentY, colW, rowH, 6);
          ctx.fill();
          ctx.stroke();

          ctx.textAlign = 'center';
          ctx.font = 'bold 13px monospace';
          ctx.fillStyle = '#334155';
          ctx.fillText('—', tileX + colW / 2, currentY + 30);
        }
      }
    }

    // --- 4. TARGET PATHOGEN SPOTLIGHT ---
    const summaryY = 600;
    const summaryH = 195;
    ctx.fillStyle = '#0f172a';
    ctx.strokeStyle = won ? 'rgba(16, 185, 129, 0.5)' : 'rgba(239, 68, 68, 0.5)';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.roundRect(contentLeft, summaryY, contentW, summaryH, 16);
    ctx.fill();
    ctx.stroke();

    // Section title
    ctx.textAlign = 'left';
    ctx.font = 'bold 12px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
    ctx.fillStyle = '#10b981';
    ctx.fillText("TODAY'S TARGET PATHOGEN", contentLeft + 24, summaryY + 30);

    // Target Organism Name
    ctx.font = 'italic bold 28px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
    ctx.fillStyle = '#f8fafc';
    ctx.fillText(target.name, contentLeft + 24, summaryY + 65);

    // Common Name + Taxonomy
    ctx.font = '14px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
    ctx.fillStyle = '#94a3b8';
    ctx.fillText(`${target.commonName}  •  ${target.taxonomy}`, contentLeft + 24, summaryY + 92);

    // Divider
    ctx.strokeStyle = '#1e293b';
    ctx.beginPath();
    ctx.moveTo(contentLeft + 24, summaryY + 108);
    ctx.lineTo(contentLeft + contentW - 24, summaryY + 108);
    ctx.stroke();

    // Treatment
    ctx.font = 'bold 14px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
    ctx.fillStyle = '#38bdf8';
    ctx.fillText('💊 Best Treatment:', contentLeft + 24, summaryY + 135);

    ctx.font = '14px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
    ctx.fillStyle = '#e2e8f0';
    ctx.fillText(target.firstLineRx, contentLeft + 170, summaryY + 135);

    // Key Lab Culture
    ctx.font = 'bold 14px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
    ctx.fillStyle = '#a78bfa';
    ctx.fillText('🧫 Key Lab:', contentLeft + 24, summaryY + 165);

    ctx.font = '13px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
    ctx.fillStyle = '#94a3b8';
    const cultureText = target.culture.length > 70 ? `${target.culture.slice(0, 68)}...` : target.culture;
    ctx.fillText(cultureText, contentLeft + 120, summaryY + 165);

    // --- 5. STATS ROW ---
    const statsY = 815;
    const statBoxW = 198;
    const statBoxH = 70;
    const statGap = 16;

    const statItems = [
      { label: 'CASES PLAYED', val: stats?.played || 1, color: '#f8fafc' },
      { label: 'WIN RATE', val: `${stats?.played > 0 ? Math.round((stats.wins / stats.played) * 100) : 100}%`, color: '#34d399' },
      { label: 'STREAK', val: `${stats?.streak || 1} 🔥`, color: '#fbbf24' },
      { label: 'BEST STREAK', val: `${stats?.maxStreak || 1} ⚡`, color: '#38bdf8' }
    ];

    statItems.forEach((st, idx) => {
      const bx = contentLeft + idx * (statBoxW + statGap);
      ctx.fillStyle = '#0f172a';
      ctx.strokeStyle = '#1e293b';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.roundRect(bx, statsY, statBoxW, statBoxH, 12);
      ctx.fill();
      ctx.stroke();

      ctx.textAlign = 'center';
      ctx.font = 'bold 22px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
      ctx.fillStyle = st.color;
      ctx.fillText(st.val, bx + statBoxW / 2, statsY + 36);

      ctx.font = 'bold 10px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
      ctx.fillStyle = '#64748b';
      ctx.fillText(st.label, bx + statBoxW / 2, statsY + 56);
    });

    // --- 6. CLEAN BRAND FOOTER ---
    const footerY = 905;
    const footerH = 88;
    ctx.fillStyle = '#080d1a';
    ctx.strokeStyle = '#1e293b';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.roundRect(contentLeft, footerY, contentW, footerH, 14);
    ctx.fill();
    ctx.stroke();

    ctx.textAlign = 'center';
    ctx.font = 'bold 16px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
    ctx.fillStyle = '#10b981';
    ctx.fillText('MICROBLEDLE', W / 2 - 100, footerY + 38);

    ctx.font = '14px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
    ctx.fillStyle = '#94a3b8';
    ctx.fillText('•   Daily Medical Microbiology Game', W / 2 + 55, footerY + 38);

    ctx.font = 'bold 14px monospace';
    ctx.fillStyle = '#38bdf8';
    ctx.fillText('Find the pathogen daily at microbledle.com', W / 2, footerY + 64);

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
      const fileName = `microbledle-${dateStr || 'case'}.png`;
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
    const fileName = `microbledle-${dateStr || 'case'}.png`;
    const file = new File([imageBlob], fileName, { type: 'image/png' });

    if (navigator.canShare && navigator.canShare({ files: [file] })) {
      try {
        await navigator.share({
          files: [file],
          title: `Microbledle (${won ? `${guesses.length}/6 Solved` : 'Unsolved'})`,
          text: `Can you find today's pathogen? Play Microbledle at https://microbledle.com/`
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
                Game Summary Card
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/20 border border-emerald-500/40 text-emerald-300">
                  Ready to Share
                </span>
              </h3>
              <p className="text-xs text-slate-400">Share your game result with colleagues & friends</p>
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
                alt="Microbledle Game Summary Card" 
                className="w-full h-auto object-contain rounded-2xl select-none"
              />
            </div>
          ) : (
            <div className="h-64 flex flex-col items-center justify-center text-slate-400 text-sm gap-2">
              <Sparkles className="w-6 h-6 text-emerald-400 animate-spin" />
              Generating summary card...
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
                Share Image
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
