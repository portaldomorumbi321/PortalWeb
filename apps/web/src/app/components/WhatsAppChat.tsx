import { useMemo } from "react";
import { Card } from "./ui/card";
import { Smartphone, PanelRightClose } from "lucide-react";
import { Button } from "./ui/button";

interface WhatsAppChatProps {
  setChatOpen: (open: boolean) => void;
  isVisible: boolean;
  isMobile?: boolean;
}

export default function WhatsAppChat({ setChatOpen, isVisible, isMobile = false }: WhatsAppChatProps) {
  const openInSameTab = () => {
    window.location.href = "https://web.whatsapp.com/";
  };

  const openInNewTab = () => {
    window.open("https://web.whatsapp.com/", "_blank", "noopener,noreferrer");
  };

  const panelClassName = useMemo(
    () => `${isMobile ? "h-full" : "h-[80vh]"} flex flex-col p-6`,
    [isMobile],
  );

  if (!isVisible) {
    return null;
  }

  return (
    <Card className={panelClassName}>
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-semibold text-lg text-gray-900">Conectar WhatsApp</h3>
        <div className="flex items-center gap-2">
          <Smartphone className="w-5 h-5 text-green-600" />
          <Button variant="ghost" size="icon" onClick={() => setChatOpen(false)} className="h-8 w-8 text-gray-500 hover:text-gray-800" title="Minimizar painel">
            <PanelRightClose className="w-5 h-5" />
          </Button>
        </div>
      </div>

      <div className="flex-1 w-full min-h-0 flex flex-col items-center justify-center text-center">
        <div className="w-16 h-16 rounded-full bg-amber-100 text-amber-700 flex items-center justify-center mb-4">
          <Smartphone className="w-8 h-8" />
        </div>

        <h4 className="font-semibold text-gray-800">Não foi possível embutir o WhatsApp Web</h4>
        <p className="text-sm text-gray-600 mt-2 max-w-md">
          O site do WhatsApp bloqueia abertura dentro de iframe por segurança. Você pode abrir agora na mesma aba.
        </p>

        <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
          <Button onClick={openInSameTab} className="bg-green-600 hover:bg-green-700 text-white">
            Abrir na mesma aba
          </Button>
          <Button onClick={openInNewTab} variant="outline" className="border-green-300 text-green-700 hover:bg-green-50">
            Abrir em nova aba
          </Button>
        </div>
      </div>
    </Card>
  );
}