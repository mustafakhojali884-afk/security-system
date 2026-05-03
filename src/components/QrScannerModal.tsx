import { useEffect, useRef, useState } from 'react';
import jsQR from 'jsqr';
import { X, Camera } from 'lucide-react';

interface QrScannerModalProps {
  onScan: (data: string) => void;
  onClose: () => void;
  title: string;
}

export default function QrScannerModal({ onScan, onClose, title }: QrScannerModalProps) {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [error, setError] = useState<string>('');
  const [stream, setStream] = useState<MediaStream | null>(null);

  useEffect(() => {
    let animationId: number;

    async function startCamera() {
      try {
        const videoStream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: 'environment' },
        });
        setStream(videoStream);

        if (videoRef.current) {
          videoRef.current.srcObject = videoStream;
          videoRef.current.setAttribute('playsinline', 'true');
          videoRef.current.play();
        }

        const scan = () => {
          if (videoRef.current && canvasRef.current && videoRef.current.readyState === videoRef.current.HAVE_ENOUGH_DATA) {
            const canvas = canvasRef.current;
            const context = canvas.getContext('2d');
            if (context) {
              canvas.height = videoRef.current.videoHeight;
              canvas.width = videoRef.current.videoWidth;
              context.drawImage(videoRef.current, 0, 0, canvas.width, canvas.height);
              const imageData = context.getImageData(0, 0, canvas.width, canvas.height);
              const code = jsQR(imageData.data, imageData.width, imageData.height, {
                inversionAttempts: 'dontInvert',
              });

              if (code) {
                // Scanned successfully!
                onScan(code.data);
                // Clean up immediately
                if (videoStream) {
                  videoStream.getTracks().forEach((track) => track.stop());
                }
                return;
              }
            }
          }
          animationId = requestAnimationFrame(scan);
        };

        animationId = requestAnimationFrame(scan);
      } catch (err: any) {
        setError('لا يمكن فتح الكاميرا، يرجى التحقق من الأذونات.');
      }
    }

    startCamera();

    return () => {
      cancelAnimationFrame(animationId);
      if (stream) {
        stream.getTracks().forEach((track) => track.stop());
      }
    };
  }, []);

  return (
    <div className="fixed inset-0 bg-slate-950/85 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 max-w-sm w-full flex flex-col gap-4 animate-in fade-in zoom-in duration-200">
        <div className="flex justify-between items-center border-b border-slate-800 pb-3">
          <div className="flex items-center gap-2">
            <Camera className="h-5 w-5 text-amber-400" />
            <span className="text-sm font-black text-white">{title}</span>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 hover:bg-slate-800 rounded-xl text-slate-400 hover:text-slate-200 transition cursor-pointer"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {error ? (
          <div className="bg-red-500/10 border border-red-500/30 text-red-400 text-xs p-3 rounded-xl">
            {error}
          </div>
        ) : (
          <div className="relative aspect-video bg-slate-950 border border-slate-800 rounded-xl overflow-hidden shadow-inner flex items-center justify-center">
            <video ref={videoRef} className="absolute inset-0 h-full w-full object-cover" />
            <canvas ref={canvasRef} className="hidden" />
            <div className="absolute inset-0 border-2 border-amber-500/40 border-dashed rounded-xl m-8 pointer-events-none animate-pulse"></div>
          </div>
        )}

        <button
          onClick={onClose}
          className="w-full py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold rounded-xl transition cursor-pointer text-sm"
        >
          إغلاق
        </button>
      </div>
    </div>
  );
}
