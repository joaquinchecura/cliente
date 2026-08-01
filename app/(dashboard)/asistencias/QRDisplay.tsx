"use client";

import { useEffect, useState } from "react";
import { QRCodeSVG } from "qrcode.react";
import { ShieldCheck, Clock, RefreshCw } from "lucide-react";

interface QRDisplayProps {
  memberId: string;
  memberName: string;
  dni: string;
  status: string;
}

export default function QRDisplay({ memberId, memberName, dni, status }: QRDisplayProps) {
  const [token, setToken] = useState<string | null>(null);
  const [timeLeft, setTimeLeft] = useState<number>(120);
  const [loading, setLoading] = useState(false);

  async function generateToken() {
    setLoading(true);
    try {
      const res = await fetch("/api/acceso/qr", { method: "POST" });
      if (res.ok) {
        const data = await res.json();
        setToken(data.token);
        setTimeLeft(120);
      }
    } catch (error) {
      console.error("Error generating QR:", error);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    generateToken();
  }, []);

  useEffect(() => {
    if (!token) return;

    const interval = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          generateToken();
          return 120;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [token]);

  const qrValue = token ? `${memberId}:${token}` : memberId;

  return (
    <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6 flex flex-col items-center">
      <div className="bg-white rounded-xl p-4 mb-4 relative">
        {loading && !token ? (
          <div className="w-[200px] h-[200px] flex items-center justify-center">
            <RefreshCw className="animate-spin text-zinc-400" size={32} />
          </div>
        ) : (
          <QRCodeSVG value={qrValue} size={200} level="H" includeMargin={true} />
        )}
        
        <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 bg-zinc-800 text-zinc-300 text-xs px-3 py-1 rounded-full border border-zinc-700">
          {Math.floor(timeLeft / 60)}:{String(timeLeft % 60).padStart(2, '0')}
        </div>
      </div>

      <div className="text-center space-y-1 mt-2">
        <p className="text-white font-semibold">{memberName}</p>
        <p className="text-sm text-zinc-500">DNI: {dni}</p>
        <div className="flex items-center justify-center gap-2 mt-3">
          {status === "ACTIVE" ? (
            <span className="flex items-center gap-1.5 text-green-400 text-sm bg-green-500/10 px-3 py-1 rounded-full">
              <ShieldCheck size={14} />
              Membresía activa
            </span>
          ) : (
            <span className="flex items-center gap-1.5 text-amber-400 text-sm bg-amber-500/10 px-3 py-1 rounded-full">
              <Clock size={14} />
              Pendiente de aprobación
            </span>
          )}
        </div>
      </div>

      <button
        onClick={generateToken}
        disabled={loading}
        className="mt-4 flex items-center gap-2 text-sm text-zinc-500 hover:text-zinc-300 transition-colors disabled:opacity-50"
      >
        <RefreshCw size={14} className={loading ? "animate-spin" : ""} />
        Regenerar QR
      </button>
    </div>
  );
}