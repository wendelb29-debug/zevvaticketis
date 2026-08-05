import { useCallback, useState } from "react";
import Cropper from "react-easy-crop";
import type { Area } from "react-easy-crop";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { Loader2, ZoomIn } from "lucide-react";

interface AvatarCropDialogProps {
  open: boolean;
  imageSrc: string | null;
  saving?: boolean;
  onClose: () => void;
  onConfirm: (blob: Blob) => void;
}

async function createCroppedBlob(imageSrc: string, crop: Area): Promise<Blob> {
  const image = await new Promise<HTMLImageElement>((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = imageSrc;
  });

  const size = Math.min(512, Math.round(crop.width));
  const canvas = document.createElement("canvas");
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("Não foi possível processar a imagem.");

  ctx.imageSmoothingQuality = "high";
  ctx.drawImage(
    image,
    crop.x,
    crop.y,
    crop.width,
    crop.height,
    0,
    0,
    size,
    size,
  );

  return new Promise<Blob>((resolve, reject) => {
    canvas.toBlob(
      (blob) => (blob ? resolve(blob) : reject(new Error("Falha ao gerar imagem."))),
      "image/jpeg",
      0.92,
    );
  });
}

export function AvatarCropDialog({ open, imageSrc, saving, onClose, onConfirm }: AvatarCropDialogProps) {
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [areaPixels, setAreaPixels] = useState<Area | null>(null);
  const [processing, setProcessing] = useState(false);

  const onCropComplete = useCallback((_: Area, pixels: Area) => {
    setAreaPixels(pixels);
  }, []);

  const handleConfirm = async () => {
    if (!imageSrc || !areaPixels) return;
    setProcessing(true);
    try {
      const blob = await createCroppedBlob(imageSrc, areaPixels);
      onConfirm(blob);
    } finally {
      setProcessing(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="bg-card sm:max-w-md rounded-3xl">
        <DialogHeader>
          <DialogTitle className="font-manrope font-extrabold text-foreground">
            Ajustar foto de perfil
          </DialogTitle>
        </DialogHeader>

        <div className="relative w-full h-72 bg-foreground/5 rounded-2xl overflow-hidden">
          {imageSrc && (
            <Cropper
              image={imageSrc}
              crop={crop}
              zoom={zoom}
              aspect={1}
              cropShape="round"
              showGrid={false}
              onCropChange={setCrop}
              onZoomChange={setZoom}
              onCropComplete={onCropComplete}
            />
          )}
        </div>

        <div className="flex items-center gap-3 px-1">
          <ZoomIn className="w-4 h-4 text-muted-fg shrink-0" />
          <Slider
            value={[zoom]}
            min={1}
            max={3}
            step={0.01}
            onValueChange={(v) => setZoom(v[0] ?? 1)}
          />
        </div>

        <p className="text-xs text-muted-fg text-center">
          Arraste para posicionar e use o zoom para enquadrar a foto no círculo.
        </p>

        <div className="flex gap-3 pt-2">
          <Button variant="outline" className="flex-1 rounded-xl" onClick={onClose} disabled={processing || saving}>
            Cancelar
          </Button>
          <Button
            className="flex-1 rounded-xl bg-primary text-primary-foreground hover:bg-primary/90 font-extrabold"
            onClick={handleConfirm}
            disabled={processing || saving || !areaPixels}
          >
            {(processing || saving) && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
            Salvar foto
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
