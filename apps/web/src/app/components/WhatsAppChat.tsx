import { useState, useEffect, useRef } from "react";
import { Card } from "./ui/card";
import { Smartphone, Loader2, CheckCircle, PanelRightClose } from "lucide-react";
import { Button } from "./ui/button";
import QRCode from "react-qr-code";
import io from "socket.io-client";

const DEFAULT_LOCAL_SOCKET_URL = `${window.location.protocol}//${window.location.hostname}:3001`;
const SOCKET_BASE_URL =
  import.meta.env.VITE_SOCKET_URL?.replace(/\/$/, '') ||
  import.meta.env.VITE_API_URL?.replace(/\/api\/?$/, '').replace(/\/$/, '') ||
  (import.meta.env.DEV ? DEFAULT_LOCAL_SOCKET_URL : (() => { throw new Error('VITE_SOCKET_URL não configurada no deploy. Defina a URL do backend de sockets.'); })());

// Conecta ao backend (Railway em produção, localhost no dev)
const socket = io(SOCKET_BASE_URL, {
  autoConnect: false,
  transports: ["websocket", "polling"],
});

type WhatsAppStatusPayload = {
  connected?: boolean;
  waitingQr?: boolean;
};

type IncomingMessagePayload = {
  id?: string;
  chatId?: string;
  from?: string;
  fromMe?: boolean;
  body?: string;
  timestamp?: number;
};

type ChatItem = {
  id: string;
  name: string;
  isGroup?: boolean;
  unreadCount?: number;
  lastMessage?: string;
  timestamp?: number | null;
  historyAvailable?: boolean;
};

type ChatMessage = {
  id: string;
  chatId: string;
  from: string;
  fromMe: boolean;
  body: string;
  timestamp: number;
  timeLabel: string;
};

type MessagesPayload = {
  chatId?: string;
  messages?: IncomingMessagePayload[];
};

interface WhatsAppChatProps {
  setChatOpen: (open: boolean) => void;
  isVisible: boolean;
  isMobile?: boolean;
}

export default function WhatsAppChat({ setChatOpen, isVisible, isMobile = false }: WhatsAppChatProps) {
  const [qrValue, setQrValue] = useState<string | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [loading, setLoading] = useState(true);
  const [statusMessages, setStatusMessages] = useState<string[]>([]);
  const [chats, setChats] = useState<ChatItem[]>([]);
  const [selectedChatId, setSelectedChatId] = useState<string | null>(null);
  const [messagesByChat, setMessagesByChat] = useState<Record<string, ChatMessage[]>>({});
  const [loadingChats, setLoadingChats] = useState(false);
  const [loadingMessages, setLoadingMessages] = useState(false);
  const [chatSearch, setChatSearch] = useState("");
  const chatsRequestInFlightRef = useRef(false);
  const lastChatsRequestAtRef = useRef(0);
  const hasRequestedChatsAfterConnectRef = useRef(false);

  const appendStatus = (text: string) => {
    setStatusMessages((prev) => [text, ...prev].slice(0, 6));
  };

  const formatTime = (unixSeconds?: number) => {
    const value = Number(unixSeconds || 0);
    if (!Number.isFinite(value) || value <= 0) {
      return "";
    }

    return new Date(value * 1000).toLocaleTimeString("pt-BR", {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const requestChats = () => {
    const now = Date.now();
    if (chatsRequestInFlightRef.current) {
      return;
    }

    if (now - lastChatsRequestAtRef.current < 1500) {
      return;
    }

    chatsRequestInFlightRef.current = true;
    lastChatsRequestAtRef.current = now;
    setLoadingChats(true);
    socket.emit("wa:getChats");
  };

  const requestMessages = (chatId: string, limit = 150) => {
    setLoadingMessages(true);
    socket.emit("wa:getMessages", { chatId, limit });
  };

  const sortChats = (list: ChatItem[]) => {
    return [...list].sort((a, b) => Number(b.timestamp || 0) - Number(a.timestamp || 0));
  };

  const normalizeMessage = (payload: IncomingMessagePayload): ChatMessage | null => {
    if (!payload?.chatId || !payload?.body) {
      return null;
    }

    const timestamp = Number(payload.timestamp || Math.floor(Date.now() / 1000));
    return {
      id: payload.id || `${Date.now()}-${Math.random()}`,
      chatId: payload.chatId,
      from: payload.from || "",
      fromMe: Boolean(payload.fromMe),
      body: payload.body,
      timestamp,
      timeLabel: formatTime(timestamp),
    };
  };

  useEffect(() => {
    if (!isVisible) {
      return;
    }

    if (!socket.connected) {
      socket.connect();
    }

    appendStatus("Aguardando status do WhatsApp...");

    const handleBackendMessage = (message: string) => {
      appendStatus(message);
    };

    const handleSocketConnect = () => {
      appendStatus("Conectado ao servidor em tempo real.");
    };

    const handleSocketDisconnect = () => {
      appendStatus("Conexão em tempo real desconectada. Tentando reconectar...");
    };

    const handleSocketConnectError = () => {
      setLoading(false);
      appendStatus("Não foi possível conectar ao servidor de chat. Verifique VITE_SOCKET_URL.");
    };

    const handleStatus = (payload: WhatsAppStatusPayload) => {
      const connected = Boolean(payload.connected);
      const waitingQr = Boolean(payload.waitingQr);

      setIsConnected(connected);
      if (connected) {
        setQrValue(null);
        setLoading(false);
        appendStatus("WhatsApp conectado e sincronizado.");
        if (!hasRequestedChatsAfterConnectRef.current) {
          hasRequestedChatsAfterConnectRef.current = true;
          setTimeout(() => requestChats(), 1200);
        }
        return;
      }

      if (waitingQr) {
        setLoading(true);
      } else {
        setLoading(false);
      }
    };

    const handleQr = (qr: string) => {
      console.log("QR Code recebido do backend no frontend");
      setQrValue(qr);
      setLoading(false);
      setIsConnected(false);
      appendStatus("QR Code pronto para leitura.");
    };

    const handleReady = () => {
      console.log("Conexão com WhatsApp estabelecida!");
      setIsConnected(true);
      setQrValue(null);
      setLoading(false);
      appendStatus("Conexão estabelecida com sucesso.");
      if (!hasRequestedChatsAfterConnectRef.current) {
        hasRequestedChatsAfterConnectRef.current = true;
        setTimeout(() => requestChats(), 1200);
      }
    };

    const handleChats = (payload: ChatItem[]) => {
      const incoming = Array.isArray(payload) ? payload : [];
      setChats(sortChats(incoming));
      setLoadingChats(false);
      chatsRequestInFlightRef.current = false;

      if (incoming.length === 0) {
        setSelectedChatId(null);
        return;
      }

      setSelectedChatId((previousSelected) => {
        if (previousSelected && incoming.some((chat) => chat.id === previousSelected)) {
          return previousSelected;
        }

        const firstChatId = incoming[0].id;
        if (firstChatId) {
          const firstChat = incoming.find((chat) => chat.id === firstChatId);
          if (firstChat?.historyAvailable !== false) {
            requestMessages(firstChatId);
          }
        }
        return firstChatId || null;
      });
    };

    const handleChatUpsert = (chat: ChatItem) => {
      if (!chat?.id) {
        return;
      }

      setChats((prev) => {
        const withoutCurrent = prev.filter((item) => item.id !== chat.id);
        return sortChats([chat, ...withoutCurrent]);
      });
    };

    const handleMessages = (payload: MessagesPayload) => {
      const chatId = payload?.chatId || "";
      if (!chatId) {
        setLoadingMessages(false);
        return;
      }

      const normalized = Array.isArray(payload.messages)
        ? payload.messages
            .map((item) => normalizeMessage(item))
            .filter((item): item is ChatMessage => Boolean(item))
            .sort((a, b) => a.timestamp - b.timestamp)
        : [];

      setMessagesByChat((prev) => ({
        ...prev,
        [chatId]: normalized,
      }));
      setLoadingMessages(false);
    };

    const handleIncomingMessage = (payload: IncomingMessagePayload) => {
      const normalized = normalizeMessage(payload);
      if (!normalized) {
        return;
      }

      setMessagesByChat((prev) => {
        const current = prev[normalized.chatId] || [];
        if (current.some((item) => item.id === normalized.id)) {
          return prev;
        }

        const next = [...current, normalized].sort((a, b) => a.timestamp - b.timestamp).slice(-250);
        return {
          ...prev,
          [normalized.chatId]: next,
        };
      });
    };

    const handleWaError = (payload: { message?: string; detail?: string }) => {
      setLoadingChats(false);
      setLoadingMessages(false);
      chatsRequestInFlightRef.current = false;
      if (payload?.message) {
        appendStatus(payload.message);
      }

      if (payload?.detail) {
        appendStatus(`Detalhe: ${payload.detail}`);
      }
    };

    socket.on("message", handleBackendMessage);
    socket.on("connect", handleSocketConnect);
    socket.on("disconnect", handleSocketDisconnect);
    socket.on("connect_error", handleSocketConnectError);
    socket.on("status", handleStatus);
    socket.on("qr", handleQr);
    socket.on("ready", handleReady);
    socket.on("wa:chats", handleChats);
    socket.on("wa:chat_upsert", handleChatUpsert);
    socket.on("wa:messages", handleMessages);
    socket.on("wa:error", handleWaError);
    socket.on("incoming_message", handleIncomingMessage);

    return () => {
      socket.off("message", handleBackendMessage);
      socket.off("connect", handleSocketConnect);
      socket.off("disconnect", handleSocketDisconnect);
      socket.off("connect_error", handleSocketConnectError);
      socket.off("status", handleStatus);
      socket.off("qr", handleQr);
      socket.off("ready", handleReady);
      socket.off("wa:chats", handleChats);
      socket.off("wa:chat_upsert", handleChatUpsert);
      socket.off("wa:messages", handleMessages);
      socket.off("wa:error", handleWaError);
      socket.off("incoming_message", handleIncomingMessage);
    };
  }, [isVisible]);

  const filteredChats = chats.filter((chat) => {
    const text = `${chat.name} ${chat.lastMessage || ""}`.toLowerCase();
    return text.includes(chatSearch.toLowerCase());
  });

  const selectedChat = chats.find((chat) => chat.id === selectedChatId) || null;
  const selectedMessages = selectedChatId ? messagesByChat[selectedChatId] || [] : [];

  const handleSelectChat = (chatId: string) => {
    setSelectedChatId(chatId);
    const chat = chats.find((item) => item.id === chatId);
    if (chat?.historyAvailable === false) {
      setMessagesByChat((prev) => ({
        ...prev,
        [chatId]: [],
      }));
      appendStatus("Histórico indisponível neste modo. Exibindo apenas contatos.");
      return;
    }

    requestMessages(chatId);
  };

  useEffect(() => {
    if (!isVisible) {
      return;
    }

    hasRequestedChatsAfterConnectRef.current = false;
  }, [isVisible]);

  return (
    <Card className={`${isMobile ? 'h-full' : 'h-[80vh]'} flex flex-col p-6`}>
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-semibold text-lg text-gray-900">Conectar WhatsApp</h3>
        <div className="flex items-center gap-2">
          <Smartphone className={`w-5 h-5 ${isConnected ? 'text-green-500' : 'text-gray-400'}`} />
          <Button variant="ghost" size="icon" onClick={() => setChatOpen(false)} className="h-8 w-8 text-gray-500 hover:text-gray-800" title="Minimizar painel">
            <PanelRightClose className="w-5 h-5" />
          </Button>
        </div>
      </div>

      <div className={`flex-1 w-full ${isConnected ? "min-h-0 flex flex-col" : "flex flex-col items-center justify-center text-center"}`}>
        {isConnected ? (
          <>
            <div className="flex items-center justify-between gap-3 rounded-md border border-green-100 bg-green-50 px-3 py-2 text-left">
              <div className="flex items-center gap-2 text-green-700">
                <CheckCircle className="w-4 h-4" />
                <span className="text-sm font-medium">WhatsApp conectado e sincronizado</span>
              </div>
              <Button variant="outline" size="sm" onClick={requestChats}>
                Atualizar chats
              </Button>
            </div>

            <div className="mt-3 min-h-0 flex-1 grid grid-cols-12 gap-3">
              <div className="col-span-4 min-h-0 rounded-md border border-gray-200 bg-white flex flex-col">
                <div className="p-2 border-b border-gray-100">
                  <input
                    value={chatSearch}
                    onChange={(e) => setChatSearch(e.target.value)}
                    placeholder="Buscar contato ou conversa"
                    className="w-full h-9 rounded-md border border-gray-200 px-3 text-sm outline-none focus:border-gray-400"
                  />
                </div>
                <div className="min-h-0 flex-1 overflow-y-auto">
                  {loadingChats ? (
                    <div className="p-3 text-sm text-gray-500">Carregando contatos e conversas...</div>
                  ) : filteredChats.length > 0 ? (
                    filteredChats.map((chat) => (
                      <button
                        key={chat.id}
                        onClick={() => handleSelectChat(chat.id)}
                        className={`w-full px-3 py-2 text-left border-b border-gray-100 hover:bg-gray-50 ${selectedChatId === chat.id ? "bg-gray-100" : ""}`}
                      >
                        <div className="flex items-center justify-between gap-2">
                          <div className="font-medium text-sm text-gray-900 truncate">{chat.name}</div>
                          <div className="text-[11px] text-gray-500">{formatTime(Number(chat.timestamp || 0))}</div>
                        </div>
                        <div className="mt-1 flex items-center justify-between gap-2">
                          <div className="text-xs text-gray-600 truncate">{chat.lastMessage || "Sem mensagens"}</div>
                          {Number(chat.unreadCount || 0) > 0 && (
                            <span className="inline-flex min-w-5 h-5 items-center justify-center rounded-full bg-green-600 px-1 text-[11px] text-white">
                              {chat.unreadCount}
                            </span>
                          )}
                        </div>
                      </button>
                    ))
                  ) : (
                    <div className="p-3 text-sm text-gray-500">Nenhuma conversa encontrada.</div>
                  )}
                </div>
              </div>

              <div className="col-span-8 min-h-0 rounded-md border border-gray-200 bg-white flex flex-col">
                <div className="px-3 py-2 border-b border-gray-100">
                  <div className="font-medium text-sm text-gray-900">{selectedChat?.name || "Selecione uma conversa"}</div>
                  <div className="text-xs text-gray-500">Espelhamento em tempo real das conversas do WhatsApp.</div>
                </div>

                <div className="min-h-0 flex-1 overflow-y-auto p-3 space-y-2 bg-gray-50">
                  {loadingMessages ? (
                    <div className="text-sm text-gray-500">Carregando mensagens...</div>
                  ) : selectedChat?.historyAvailable === false ? (
                    <div className="text-sm text-gray-500">Histórico não disponível neste modo de compatibilidade.</div>
                  ) : selectedChatId ? (
                    selectedMessages.length > 0 ? (
                      selectedMessages.map((message) => (
                        <div key={message.id} className={`flex ${message.fromMe ? "justify-end" : "justify-start"}`}>
                          <div className={`max-w-[85%] rounded-lg px-3 py-2 text-sm ${message.fromMe ? "bg-green-100 text-gray-900" : "bg-white border border-gray-200 text-gray-900"}`}>
                            <div className="whitespace-pre-wrap break-words">{message.body}</div>
                            <div className="mt-1 text-[10px] text-gray-500 text-right">{message.timeLabel}</div>
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="text-sm text-gray-500">Sem mensagens neste chat.</div>
                    )
                  ) : (
                    <div className="text-sm text-gray-500">Selecione um contato para abrir a conversa.</div>
                  )}
                </div>
              </div>
            </div>

            <div className="w-full mt-3 border-t pt-3">
              <h5 className="text-sm font-semibold text-gray-800 text-left">Status da conexão</h5>
              <ul className="mt-2 space-y-1 text-xs text-gray-600 text-left max-h-20 overflow-y-auto">
                {statusMessages.length > 0 ? (
                  statusMessages.map((message, index) => <li key={`${message}-${index}`}>• {message}</li>)
                ) : (
                  <li>• Sem atualizações de status.</li>
                )}
              </ul>
            </div>
          </>
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

            <div className="w-full mt-6 border-t pt-4">
              <h5 className="text-sm font-semibold text-gray-800 text-left">Status da conexão</h5>
              <ul className="mt-2 space-y-1 text-xs text-gray-600 text-left max-h-20 overflow-y-auto">
                {statusMessages.length > 0 ? (
                  statusMessages.map((message, index) => <li key={`${message}-${index}`}>• {message}</li>)
                ) : (
                  <li>• Sem atualizações de status.</li>
                )}
              </ul>
            </div>
          </>
        )}
      </div>
    </Card>
  );
}