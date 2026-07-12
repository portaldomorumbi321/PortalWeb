import { useState, useEffect } from "react";
import { Card } from "./ui/card";
import { Smartphone, RefreshCw, Loader2, CheckCircle, PanelRightClose } from "lucide-react";
import { Button } from "./ui/button";
import QRCode from "react-qr-code";
import io from "socket.io-client";

// Conecta ao nosso servidor backend
const socket = io("http://localhost:3001");

interface WhatsAppChatProps {
  setChatOpen: (open: boolean) => void;
  isVisible: boolean;
}

export default function WhatsAppChat({ setChatOpen, isVisible }: WhatsAppChatProps) {
  const [qrValue, setQrValue] = useState<string | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!isVisible) {
      // Se o painel não está visível, não faz nada.
      // O backend também poderia ser otimizado para desconectar aqui.
      return;
    }

    // Ouve o evento 'qr' do backend
    socket.on('qr', (qr) => {
      console.log("QR Code recebido do backend no frontend");
      setQrValue(qr);
      setLoading(false);
      setIsConnected(false);
    });

    // Ouve o evento 'ready' do backend
    socket.on('ready', () => {
      console.log("Conexão com WhatsApp estabelecida!");
      setIsConnected(true);
      setQrValue(null);
      setLoading(false);
    });

    // Limpa os listeners ao desmontar o componente
    return () => {
      socket.off('qr');
      socket.off('ready');
    };
  }, [isVisible]);

  return (
    <Card className="h-[80vh] flex flex-col p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-semibold text-lg text-gray-900">Conectar WhatsApp</h3>
        <div className="flex items-center gap-2">
          <Smartphone className={`w-5 h-5 ${isConnected ? 'text-green-500' : 'text-gray-400'}`} />
          <Button variant="ghost" size="icon" onClick={() => setChatOpen(false)} className="h-8 w-8 text-gray-500 hover:text-gray-800" title="Minimizar painel">
            <PanelRightClose className="w-5 h-5" />
          </Button>
        </div>
      </div>

      <div className="flex-1 flex flex-col items-center justify-center text-center">
        {isConnected ? (
          <div className="flex flex-col items-center text-green-600">
            <CheckCircle className="w-16 h-16 mb-4" />
            <h4 className="font-semibold text-lg">WhatsApp Conectado!</h4>
            <p className="text-sm text-gray-600 mt-1">Você já pode receber e enviar mensagens.</p>
          </div>
        ) : (
          <>
            <div className="relative w-48 h-48 bg-gray-100 rounded-lg flex items-center justify-center mb-6 p-4">
              {loading ? (
                <div className="flex flex-col items-center text-gray-500">
                  <Loader2 className="w-8 h-8 animate-spin" />
                  <p className="text-xs mt-2">Aguardando QR Code...</p>
                </div>
              ) : qrValue ? (
                <div style={{ height: "auto", margin: "0 auto", maxWidth: 176, width: "100%" }}>
                  <QRCode value={qrValue} size={256} style={{ height: "auto", maxWidth: "100%", width: "100%" }} viewBox={`0 0 256 256`} />
                </div>
              ) : null}
            </div>

            <h4 className="font-semibold text-gray-800">Use o WhatsApp no seu computador</h4>

            <ol className="text-sm text-gray-600 list-decimal list-inside space-y-2 mt-4">
              <li>Abra o WhatsApp no seu celular.</li>
              <li>Toque em <strong>Menu</strong> ou <strong>Configurações</strong> e selecione <strong>Aparelhos conectados</strong>.</li>
              <li>Aponte seu celular para esta tela para capturar o código.</li>
            </ol>
          </>
        )}
      </div>
    </Card>
  );
}