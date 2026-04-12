import { useState, useEffect, useRef } from "react";
import { MessageSquare, Plus, Clock, CheckCircle2, AlertCircle, ChevronRight, Send, ImageIcon, X as XIcon } from "lucide-react";
import api from "../services/api";
import { toast } from "sonner";
import clsx from "clsx";
import { format } from "date-fns";

interface Message {
  id: string;
  message: string;
  senderType: "SUPER_ADMIN" | "DISTRIBUTOR";
  createdAt: string;
}

interface Ticket {
  id: string;
  subject: string;
  message: string;
  status: "OPEN" | "IN_PROGRESS" | "CLOSED";
  lastReplyAt: string;
  createdAt: string;
  messages: Message[];
}

export default function SupportTickets() {
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedTicket, setSelectedTicket] = useState<Ticket | null>(null);
  const [newMessage, setNewMessage] = useState("");
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newTicket, setNewTicket] = useState({ subject: "", message: "" });
  const [sending, setSending] = useState(false);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [uploadingImage, setUploadingImage] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    fetchTickets();
  }, []);

  const fetchTickets = async () => {
    try {
      const res = await api.get("/support/company/tickets");
      setTickets(res.data);
    } catch (error) {
      toast.error("Murojaatlarni yuklashda xatolik yuz berdi");
    } finally {
      setLoading(false);
    }
  };

  const handleCreateTicket = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTicket.subject || !newTicket.message) return;

    setSending(true);
    try {
      await api.post("/support/ticket", newTicket);
      toast.success("Murojaat yuborildi");
      setShowCreateModal(false);
      setNewTicket({ subject: "", message: "" });
      fetchTickets();
    } catch (error) {
      toast.error("Xatolik yuz berdi");
    } finally {
      setSending(false);
    }
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) {
      toast.error("Rasm 5MB dan katta bo'lmasligi kerak");
      return;
    }
    setImageFile(file);
    setImagePreview(URL.createObjectURL(file));
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if ((!newMessage.trim() && !imageFile) || !selectedTicket) return;

    setSending(true);
    try {
      let imageUrl: string | undefined;
      if (imageFile) {
        setUploadingImage(true);
        const form = new FormData();
        form.append("file", imageFile);
        const uploadRes = await api.post("/upload/image", form, {
          headers: { "Content-Type": "multipart/form-data" },
        });
        imageUrl = uploadRes.data?.url;
        setUploadingImage(false);
      }

      const payload: { message: string; imageUrl?: string } = {
        message: newMessage || " ",
      };
      if (imageUrl) payload.imageUrl = imageUrl;

      const res = await api.post(`/support/message/${selectedTicket.id}`, payload);
      setSelectedTicket({
        ...selectedTicket,
        messages: [...selectedTicket.messages, res.data],
        status: "OPEN",
      });
      setNewMessage("");
      setImageFile(null);
      setImagePreview(null);
      if (fileInputRef.current) fileInputRef.current.value = "";
      fetchTickets();
    } catch (error) {
      toast.error("Xabarni yuborishda xatolik yuz berdi");
    } finally {
      setSending(false);
      setUploadingImage(false);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "OPEN":
        return <span className="px-2 py-1 bg-blue-100 text-blue-700 text-xs font-medium rounded-full flex items-center gap-1"><Clock size={12} /> Yangi</span>;
      case "IN_PROGRESS":
        return <span className="px-2 py-1 bg-amber-100 text-amber-700 text-xs font-medium rounded-full flex items-center gap-1"><AlertCircle size={12} /> Jarayonda</span>;
      case "CLOSED":
        return <span className="px-2 py-1 bg-emerald-100 text-emerald-700 text-xs font-medium rounded-full flex items-center gap-1"><CheckCircle2 size={12} /> Yopilgan</span>;
      default:
        return null;
    }
  };

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-3">
            <MessageSquare className="text-indigo-600" />
            Murojaatlar va Qo'llab-quvvatlash
          </h1>
          <p className="text-slate-500 dark:text-slate-400 mt-1">
            Super dmin bilan bog'lanish va savollaringizga javob olish
          </p>
        </div>
        <button
          onClick={() => setShowCreateModal(true)}
          className="flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl shadow-lg shadow-indigo-200 dark:shadow-none transition-all active:scale-95"
        >
          <Plus size={18} />
          Yangi murojaat
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-[600px]">
        {/* Ticket List */}
        <div className="lg:col-span-1 bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700 flex flex-col overflow-hidden">
          <div className="p-4 border-b border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800/50">
            <span className="text-sm font-semibold text-slate-700 dark:text-slate-300">Barcha murojaatlar</span>
          </div>
          <div className="flex-1 overflow-y-auto p-2 space-y-1">
            {loading ? (
              <div className="p-8 text-center text-slate-400">Yuklanmoqda...</div>
            ) : tickets.length === 0 ? (
              <div className="p-8 text-center text-slate-400">Sizda hali murojaatlar yo'q</div>
            ) : (
              tickets.map((ticket) => (
                <button
                  key={ticket.id}
                  onClick={() => setSelectedTicket(ticket)}
                  className={clsx(
                    "w-full text-left p-4 rounded-xl border transition-all relative group",
                    selectedTicket?.id === ticket.id
                      ? "bg-indigo-50 border-indigo-200 dark:bg-indigo-900/20 dark:border-indigo-800"
                      : "bg-white border-transparent hover:bg-slate-50 dark:bg-slate-800 dark:hover:bg-slate-700/50"
                  )}
                >
                  <div className="flex justify-between items-start mb-2">
                    {getStatusBadge(ticket.status)}
                    <span className="text-[10px] text-slate-400 font-mono">#{ticket.id.slice(0,8)}</span>
                  </div>
                  <h3 className="font-semibold text-slate-900 dark:text-white truncate pr-4">{ticket.subject}</h3>
                  <div className="flex items-center gap-2 mt-2 text-[11px] text-slate-500">
                    <Clock size={10} />
                    {format(new Date(ticket.lastReplyAt), "dd.MM.yyyy HH:mm")}
                  </div>
                  <ChevronRight size={16} className={clsx(
                    "absolute right-2 top-1/2 -translate-y-1/2 text-slate-300 transition-transform",
                    selectedTicket?.id === ticket.id ? "translate-x-0 opacity-100" : "-translate-x-2 opacity-0 group-hover:translate-x-0 group-hover:opacity-100"
                  )} />
                </button>
              ))
            )}
          </div>
        </div>

        {/* Chat Area */}
        <div className="lg:col-span-2 bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700 flex flex-col overflow-hidden">
          {selectedTicket ? (
            <>
              <div className="p-4 border-b border-slate-200 dark:border-slate-700 flex items-center justify-between">
                <div>
                  <h2 className="font-bold text-slate-900 dark:text-white">{selectedTicket.subject}</h2>
                  <p className="text-xs text-slate-500">ID: {selectedTicket.id}</p>
                </div>
                {getStatusBadge(selectedTicket.status)}
              </div>
              
              <div className="flex-1 overflow-y-auto p-6 space-y-4 bg-slate-50/50 dark:bg-slate-900/10">
                {selectedTicket.messages.map((msg) => {
                  const isMe = msg.senderType === "DISTRIBUTOR";
                  const hasImage = (msg as any).imageUrl;
                  return (
                    <div key={msg.id} className={clsx("flex flex-col", isMe ? "items-end" : "items-start")}>
                      <div className={clsx(
                        "max-w-[80%] rounded-2xl text-sm shadow-sm overflow-hidden",
                        isMe
                          ? "bg-indigo-600 text-white rounded-tr-none"
                          : "bg-white dark:bg-slate-700 text-slate-900 dark:text-white rounded-tl-none border border-slate-100 dark:border-slate-600"
                      )}>
                        {hasImage && (
                          <a href={(msg as any).imageUrl} target="_blank" rel="noopener noreferrer">
                            <img
                              src={(msg as any).imageUrl}
                              alt="attachment"
                              className="max-w-full max-h-64 object-contain w-full"
                            />
                          </a>
                        )}
                        {msg.message.trim() && msg.message.trim() !== " " && (
                          <div className="p-4">
                            {!isMe && <span className="text-[10px] block opacity-60 mb-1 font-bold">SUPER ADMIN</span>}
                            {msg.message}
                          </div>
                        )}
                        {!hasImage && msg.message.trim() === " " && (
                          <div className="p-4">
                            {!isMe && <span className="text-[10px] block opacity-60 mb-1 font-bold">SUPER ADMIN</span>}
                          </div>
                        )}
                      </div>
                      <span className="text-[10px] text-slate-400 mt-1 px-1">
                        {format(new Date(msg.createdAt), "HH:mm")}
                      </span>
                    </div>
                  );
                })}
              </div>

              {selectedTicket.status !== "CLOSED" ? (
                <form onSubmit={handleSendMessage} className="p-4 bg-white dark:bg-slate-800 border-t border-slate-200 dark:border-slate-700 space-y-2">
                  {imagePreview && (
                    <div className="relative inline-block">
                      <img src={imagePreview} alt="preview" className="h-24 rounded-xl object-cover border border-slate-200 dark:border-slate-700" />
                      <button
                        type="button"
                        onClick={() => { setImagePreview(null); setImageFile(null); if (fileInputRef.current) fileInputRef.current.value = ""; }}
                        className="absolute -top-2 -right-2 w-6 h-6 bg-rose-500 text-white rounded-full flex items-center justify-center hover:bg-rose-600 transition-all"
                      >
                        <XIcon size={12} />
                      </button>
                    </div>
                  )}
                  <div className="flex gap-3">
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={handleImageChange}
                    />
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      disabled={sending}
                      title="Rasm yuklash"
                      className="p-2.5 bg-slate-50 dark:bg-slate-900 text-slate-500 hover:text-indigo-600 border border-slate-200 dark:border-slate-700 rounded-xl transition-all disabled:opacity-50 active:scale-95"
                    >
                      <ImageIcon size={20} />
                    </button>
                    <input
                      type="text"
                      value={newMessage}
                      onChange={(e) => setNewMessage(e.target.value)}
                      placeholder="Xabar yozing..."
                      disabled={sending}
                      className="flex-1 px-4 py-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none transition-all dark:text-white"
                    />
                    <button
                      type="submit"
                      disabled={sending || (!newMessage.trim() && !imageFile)}
                      className="p-2.5 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 transition-all disabled:opacity-50 disabled:scale-100 active:scale-95 flex items-center justify-center w-12"
                    >
                      {uploadingImage ? (
                        <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      ) : (
                        <Send size={20} />
                      )}
                    </button>
                  </div>
                </form>
              ) : (
                <div className="p-4 text-center text-slate-400 bg-slate-50 dark:bg-slate-900 border-t border-slate-200 dark:border-slate-700 italic">
                  Bu murojaat yopilgan. Savollaringiz bo'lsa yangi murojaat yarating.
                </div>
              )}
            </>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center text-slate-400 p-8 space-y-4">
              <div className="w-16 h-16 bg-slate-50 dark:bg-slate-700/50 rounded-full flex items-center justify-center">
                <MessageSquare size={32} className="opacity-20" />
              </div>
              <p>Murojaatni batafsil ko'rish uchun uni tanlang</p>
            </div>
          )}
        </div>
      </div>

      {/* Create Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
          <div className="bg-white dark:bg-slate-800 rounded-3xl shadow-2xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in duration-200">
            <div className="p-6 border-b border-slate-100 dark:border-slate-700 flex justify-between items-center bg-slate-50/50 dark:bg-slate-800/50">
              <h2 className="text-xl font-bold text-slate-900 dark:text-white">Yangi murojaat</h2>
              <button onClick={() => setShowCreateModal(false)} className="p-2 hover:bg-white dark:hover:bg-slate-700 rounded-xl transition-all"><XIcon size={20} /></button>
            </div>
            <form onSubmit={handleCreateTicket} className="p-6 space-y-4">
              <div className="space-y-1.5">
                <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">Mavzu</label>
                <input
                  type="text"
                  required
                  value={newTicket.subject}
                  onChange={(e) => setNewTicket({...newTicket, subject: e.target.value})}
                  className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-2xl focus:ring-2 focus:ring-indigo-500 outline-none transition-all dark:text-white"
                  placeholder="Masalan: To'lov haqida savol"
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">Xabar matni</label>
                <textarea
                  required
                  rows={4}
                  value={newTicket.message}
                  onChange={(e) => setNewTicket({...newTicket, message: e.target.value})}
                  className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-2xl focus:ring-2 focus:ring-indigo-500 outline-none transition-all dark:text-white resize-none"
                  placeholder="Murojaatingizni batafsil yozing..."
                />
              </div>
              <button
                type="submit"
                disabled={sending}
                className="w-full py-4 bg-indigo-600 text-white rounded-2xl font-bold hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-100 dark:shadow-none disabled:opacity-50 active:scale-95"
              >
                {sending ? "Yuborilmoqda..." : "Yuborish"}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

