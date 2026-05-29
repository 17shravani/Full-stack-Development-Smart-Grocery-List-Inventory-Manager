import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { Scan, FileText, UploadCloud, Cpu, Layers, Sparkles, Check } from 'lucide-react';

export default function ReceiptScanner() {
  const { uploadReceiptOCRText } = useApp();
  const [receiptText, setReceiptText] = useState('');
  const [storeName, setStoreName] = useState('Smart Grocery Mart');
  const [isScanning, setIsScanning] = useState(false);
  const [scanResult, setScanResult] = useState(null);

  const sampleReceipts = [
    {
      store: "D-Mart Superstore",
      text: "D-MART MUMBAI\n====================\nOrganic Amul Milk 2L Rs 136.00\nWhole Wheat Bread 1 packs Rs 45.00\nPremium Basmati Rice 5kg Rs 600.00\nPaneer (Cottage Cheese) 1 pieces Rs 80.00\n====================\nTotal Items: 4"
    },
    {
      store: "Reliance Smart Mart",
      text: "RELIANCE SMART #45\n====================\nBrown Eggs (Dozen) 1 packs Rs 110.00\nVine Tomatoes 2kg Rs 72.00\nOrganic Amul Milk 1L Rs 68.00\n====================\nTotal Items: 3"
    }
  ];

  const handleScan = async (e) => {
    e.preventDefault();
    if (!receiptText.trim()) return;

    setIsScanning(true);
    setScanResult(null);

    // Simulate scanning laser sweeps with a delay
    setTimeout(async () => {
      try {
        const res = await uploadReceiptOCRText(receiptText, storeName);
        setScanResult(res.importedItems || []);
        setIsScanning(false);
        setReceiptText('');
      } catch (err) {
        setIsScanning(false);
        alert("Receipt parsing failed.");
      }
    }, 2800);
  };

  return (
    <div className="grid md:grid-cols-12 gap-8">
      {/* Scanner Input Panel */}
      <div className="md:col-span-7 space-y-6">
        <div className="glass-panel rounded-2xl border border-gray-800 p-6 shadow-xl relative overflow-hidden">
          
          {/* Laser scanning visual element overlay */}
          {isScanning && (
            <div className="absolute inset-0 z-10 pointer-events-none overflow-hidden bg-cyber-indigo/5">
              {/* Vertical neon scan line sweeping */}
              <div className="w-full h-1 bg-gradient-to-r from-transparent via-cyber-indigo to-transparent opacity-80 shadow-[0_0_15px_#6366f1] animate-[bounce_2.5s_infinite]"></div>
            </div>
          )}

          <h3 className="text-xl font-bold tracking-tight text-white flex items-center gap-2 mb-2">
            <Scan className="text-cyber-indigo h-5 w-5 animate-pulse" />
            Smart OCR Receipt Scanner
          </h3>
          <p className="text-xs text-gray-400 mb-5">Upload bill photos or input item receipts to dynamically parse prices, units, and inventory lots.</p>

          {/* Quick Mock templates */}
          <div className="mb-5 space-y-2">
            <span className="text-[10px] text-gray-500 uppercase font-black tracking-widest block">Select A Premium Mock Receipt Template</span>
            <div className="flex gap-3">
              {sampleReceipts.map((sr, idx) => (
                <button
                  key={idx}
                  onClick={() => {
                    setReceiptText(sr.text);
                    setStoreName(sr.store);
                    setScanResult(null);
                  }}
                  className="flex-1 text-left p-3 rounded-xl border border-gray-800 bg-gray-900/40 hover:bg-gray-800 hover:border-cyber-indigo/40 transition-all text-xs"
                >
                  <div className="font-bold text-white flex items-center gap-1.5 mb-1">
                    <FileText className="h-3.5 w-3.5 text-cyber-indigo" />
                    {sr.store}
                  </div>
                  <div className="text-[10px] text-gray-400 line-clamp-2 leading-snug">{sr.text.split('\n')[2]}</div>
                </button>
              ))}
            </div>
          </div>

          {/* Core scan form */}
          <form onSubmit={handleScan} className="space-y-4">
            <div>
              <label className="text-[10px] text-gray-500 uppercase font-black tracking-widest block mb-1">Supermarket / Merchant Name</label>
              <input
                type="text"
                placeholder="e.g. D-Mart"
                value={storeName}
                onChange={e => setStoreName(e.target.value)}
                className="w-full bg-gray-950 border border-gray-800 rounded-xl p-3 text-xs text-white focus:outline-none focus:border-cyber-indigo font-semibold"
              />
            </div>

            <div>
              <label className="text-[10px] text-gray-500 uppercase font-black tracking-widest block mb-1">Receipt Raw Text Content</label>
              <textarea
                rows="6"
                required
                placeholder="Paste or write receipt details. E.g.&#10;Organic Amul Milk 2L Rs 130.00&#10;Premium Basmati Rice 5kg Rs 600.00"
                value={receiptText}
                onChange={e => setReceiptText(e.target.value)}
                className="w-full bg-gray-950 border border-gray-800 rounded-xl p-3.5 text-xs text-white focus:outline-none focus:border-cyber-indigo font-mono placeholder:text-gray-700"
              ></textarea>
            </div>

            <button
              type="submit"
              disabled={isScanning || !receiptText.trim()}
              className={`w-full py-3.5 rounded-xl font-extrabold text-xs tracking-wider uppercase transition-all flex items-center justify-center gap-2 ${
                isScanning || !receiptText.trim()
                  ? 'bg-gray-800 text-gray-500 cursor-not-allowed border border-gray-900'
                  : 'bg-cyber-indigo hover:bg-indigo-600 text-white shadow-[0_0_12px_rgba(99,102,241,0.3)]'
              }`}
            >
              {isScanning ? (
                <>
                  <Cpu className="h-4 w-4 animate-spin" />
                  Running AI OCR Parser...
                </>
              ) : (
                <>
                  <Scan className="h-4 w-4" />
                  Run AI OCR Scanner
                </>
              )}
            </button>
          </form>

        </div>
      </div>

      {/* Results Display Panel */}
      <div className="md:col-span-5">
        <div className="glass-panel rounded-2xl border border-gray-800 p-6 shadow-xl h-full flex flex-col justify-between min-h-[380px]">
          
          <div>
            <h4 className="text-sm font-extrabold text-white uppercase tracking-wider flex items-center gap-2 mb-4 border-b border-gray-850 pb-2.5">
              <Layers className="text-cyber-green h-4.5 w-4.5" />
              OCR Parsing Output
            </h4>

            {isScanning ? (
              <div className="flex flex-col items-center justify-center py-20 text-center space-y-4">
                <Cpu className="h-10 w-10 text-cyber-indigo animate-spin" />
                <div>
                  <div className="text-xs font-bold text-white uppercase tracking-wider">AI Ingestion Loop Running</div>
                  <p className="text-[10px] text-gray-500 mt-0.5">Extracting semantic tokens, indexing prices, and creating pantry shelf lots...</p>
                </div>
              </div>
            ) : scanResult ? (
              <div className="space-y-3 max-h-[300px] overflow-y-auto pr-1">
                <div className="flex items-center gap-2 p-2 bg-emerald-500/10 border border-emerald-500/30 rounded-xl mb-3">
                  <Check className="h-4 w-4 text-cyber-green" />
                  <span className="text-[10px] text-cyber-green font-extrabold uppercase tracking-wide">Import Successful! Items Seeded</span>
                </div>

                {scanResult.map((item, idx) => (
                  <div key={idx} className="p-3 bg-gray-900/60 rounded-xl border border-gray-850 flex items-center justify-between">
                    <div>
                      <div className="text-xs font-bold text-white">{item.name}</div>
                      <div className="text-[9px] text-cyber-indigo font-bold uppercase tracking-wider mt-0.5">{item.category}</div>
                    </div>
                    <div className="text-right">
                      <div className="text-xs font-black text-white">{item.qty} {item.unit}</div>
                      <div className="text-[10px] text-gray-400 font-bold">INR {item.price}</div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-20 text-center space-y-3">
                <Sparkles className="h-8 w-8 text-gray-700" />
                <p className="text-xs text-gray-500 italic uppercase tracking-wider font-semibold">Ready for parsing. Choose a template and run scanner.</p>
              </div>
            )}
          </div>

          <div className="text-[9px] text-gray-500 font-bold uppercase tracking-widest text-center mt-6 border-t border-gray-900/40 pt-3">
            Powered by AetherGro Neural Extraction Engine
          </div>

        </div>
      </div>
    </div>
  );
}
