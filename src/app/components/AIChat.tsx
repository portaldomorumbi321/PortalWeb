import { useState } from "react";
import { Card } from "./ui/card";
import { Bot, Send, PanelLeftClose } from "lucide-react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";

interface AIChatProps {
  setAiChatOpen: (open: boolean) => void;
}

const initialMessages = [
  { sender: 'ai', text: 'Olá! Sou seu assistente de IA. Como posso ajudar a planejar sua próxima viagem?' },
];

export default function AIChat({ setAiChatOpen }: AIChatProps) {
  const [messages, setMessages] = useState(initialMessages);
  const [input, setInput] = useState('');

  const handleSend = () => {
    if (!input.trim()) return;
    const newMessages = [...messages, { sender: 'user', text: input }];
    // Simulação de resposta da IA
    setTimeout(() => {
      setMessages([...newMessages, { sender: 'ai', text: 'Entendido. Buscando as melhores opções para você...' }]);
    }, 1000);
    setMessages(newMessages);
    setInput('');
  };

  return (
    <Card className="h-[80vh] flex flex-col p-4">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Bot className="w-6 h-6 text-blue-600" />
          <h3 className="font-semibold text-lg text-gray-900">Agente IA</h3>
        </div>
        <Button variant="ghost" size="icon" onClick={() => setAiChatOpen(false)} className="h-8 w-8 text-gray-500 hover:text-gray-800" title="Minimizar painel">
          <PanelLeftClose className="w-5 h-5" />
        </Button>
      </div>

      <div className="flex-1 space-y-4 overflow-y-auto p-2 bg-gray-50 rounded-lg">
        {messages.map((msg, index) => (
          <div key={index} className={`flex ${msg.sender === 'ai' ? 'justify-start' : 'justify-end'}`}>
            <div className={`max-w-xs px-3 py-2 rounded-lg ${msg.sender === 'ai' ? 'bg-blue-100 text-blue-900' : 'bg-white shadow-sm'}`}>
              <p className="text-sm">{msg.text}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-4 flex items-center gap-2">
        <Input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyPress={(e) => e.key === 'Enter' && handleSend()}
          placeholder="Pergunte algo..."
        />
        <Button onClick={handleSend} size="icon" className="bg-blue-600 hover:bg-blue-700 flex-shrink-0">
          <Send size={20} />
        </Button>
      </div>
    </Card>
  );
}