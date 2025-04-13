// components/DraggableChatbot.tsx
import React, { useState, useRef, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { X, MessageSquare, Loader2, Send, Trash2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { chatWithCollabifyAI } from "@/lib/chatWithCollabifyAI";
import { useTranslation } from "react-i18next"; // added translation hook

// Create a motion-wrapped version of Card
const MotionCard = motion(Card);

/* --------------------------------------------------------------------------
   Custom Markdown Components
   --------------------------------------------------------------------------
   We define base components then create two variants—one for user messages
   (forcing black text on paragraphs) and one for model messages (keeping white text).
   Additionally, we override links so that any link starting with "#" has its default
   behavior prevented, and all links open in a new tab.
-------------------------------------------------------------------------- */
const baseMarkdownComponents = {
  h1: ({ children, ...props }: any) => (
    <h1 className="text-2xl font-bold my-4 border-b-2 border-white pb-2 overflow-x-auto" {...props}>
      {children}
    </h1>
  ),
  h2: ({ children, ...props }: any) => (
    <h2 className="text-xl font-bold my-3 border-b border-white pb-1 overflow-x-auto" {...props}>
      {children}
    </h2>
  ),
  h3: ({ children, ...props }: any) => (
    <h3 className="text-lg font-bold my-3 overflow-x-auto" {...props}>
      {children}
    </h3>
  ),
  h4: ({ children, ...props }: any) => (
    <h4 className="text-base font-bold my-2 overflow-x-auto" {...props}>
      {children}
    </h4>
  ),
  h5: ({ children, ...props }: any) => (
    <h5 className="text-sm font-bold my-2 overflow-x-auto" {...props}>
      {children}
    </h5>
  ),
  h6: ({ children, ...props }: any) => (
    <h6 className="text-xs font-bold my-2 overflow-x-auto" {...props}>
      {children}
    </h6>
  ),
  p: ({ children, ...props }: any) => (
    <p className="mb-3 leading-relaxed overflow-x-auto" {...props}>
      {children}
    </p>
  ),
  blockquote: ({ children, ...props }: any) => (
    <blockquote className="border-l-4 border-white pl-4 italic my-3 text-white overflow-x-auto" {...props}>
      {children}
    </blockquote>
  ),
  hr: ({ ...props }: any) => <hr className="border-t border-white my-3" {...props} />,
  code: ({ inline, children, ...props }: any) => {
    if (inline) {
      return (
        <code className="bg-white text-black px-1 py-0.5 rounded text-sm font-mono overflow-x-auto" {...props}>
          {children}
        </code>
      );
    }
    return (
      <pre className="bg-white text-black p-2 rounded text-sm font-mono overflow-x-auto my-3" {...props}>
        <code>{children}</code>
      </pre>
    );
  },
  table: ({ children, ...props }: any) => (
    <div className="overflow-x-auto my-3">
      <table className="min-w-full border-collapse border border-white text-sm" {...props}>
        {children}
      </table>
    </div>
  ),
  thead: ({ children, ...props }: any) => (
    <thead className="bg-white border-b border-white text-black" {...props}>
    {children}
    </thead>
  ),
  tbody: ({ children, ...props }: any) => <tbody {...props}>{children}</tbody>,
  tr: ({ children, ...props }: any) => (
    <tr className="border-b last:border-0" {...props}>
      {children}
    </tr>
  ),
  th: ({ children, ...props }: any) => (
    <th className="border border-white px-3 py-2 font-semibold text-left overflow-x-auto" {...props}>
      {children}
    </th>
  ),
  td: ({ children, ...props }: any) => (
    <td className="border border-white px-3 py-2 overflow-x-auto" {...props}>
      {children}
    </td>
  ),
  a: ({ href, children, ...props }: any) => (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      onClick={(e) => {
        if (href && href.startsWith("#")) {
          e.preventDefault();
        }
      }}
      className="text-blue-400 hover:underline cursor-pointer"
      {...props}
    >
      {children}
    </a>
  ),
};

const userMarkdownComponents = {
  ...baseMarkdownComponents,
  p: ({ children, ...props }: any) => (
    <p className="mb-3 leading-relaxed text-black overflow-x-auto" {...props}>
      {children}
    </p>
  ),
};

const modelMarkdownComponents = {
  ...baseMarkdownComponents,
  p: ({ children, ...props }: any) => (
    <p className="mb-3 leading-relaxed text-white overflow-x-auto" {...props}>
      {children}
    </p>
  ),
};

/* --------------------------------------------------------------------------
   Chat Message Type & Animation Variants
-------------------------------------------------------------------------- */
interface Message {
  sender: "user" | "model";
  text: string;
  length?: number;
}

const bubbleVariants = {
  hidden: { opacity: 0, y: 10, scale: 0.95 },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: { duration: 0.3, ease: "easeOut" },
  },
};

/* --------------------------------------------------------------------------
   DraggableChatbot Component
-------------------------------------------------------------------------- */
const DraggableChatbot: React.FC = () => {
  const { t } = useTranslation("chatbot");

  // Modal and conversation state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("draggableChatbotMessages");
      if (saved) {
        try {
          return JSON.parse(saved);
        } catch (e) {
          console.error("Error parsing messages", e);
        }
      }
    }
    return [];
  });
  const [userInput, setUserInput] = useState("");
  const [loading, setLoading] = useState(false);

  // Draggable toggler button state and refs
  const margin = 16;
  const [position, setPosition] = useState<{ x: number; y: number }>({ x: margin, y: 0 });
  // alignment: "left" or "right" flag to preserve the edge alignment when resizing
  const [alignment, setAlignment] = useState<"left" | "right">("left");
  const buttonRef = useRef<HTMLDivElement>(null);
  const isDragging = useRef(false);
  const dragOffset = useRef({ x: 0, y: 0 });

  // On mount, load toggler position from localStorage or default to left edge, vertically centered.
  useEffect(() => {
    if (typeof window !== "undefined") {
      const savedPos = localStorage.getItem("draggableChatbotPosition");
      if (savedPos) {
        const pos = JSON.parse(savedPos);
        setPosition(pos);
        setAlignment(pos.x > window.innerWidth / 2 ? "right" : "left");
      } else if (buttonRef.current) {
        const { height } = buttonRef.current.getBoundingClientRect();
        setPosition({ x: margin, y: window.innerHeight / 2 - height / 2 });
        setAlignment("left");
      } else {
        setPosition({ x: margin, y: window.innerHeight / 2 });
        setAlignment("left");
      }
    }
  }, []);

  // Persist conversation messages to localStorage whenever they update.
  useEffect(() => {
    if (typeof window !== "undefined") {
      localStorage.setItem("draggableChatbotMessages", JSON.stringify(messages));
    }
  }, [messages]);

  // Save toggler position and alignment to localStorage.
  const savePosition = (newPos: { x: number; y: number }, align: "left" | "right") => {
    localStorage.setItem("draggableChatbotPosition", JSON.stringify(newPos));
    setAlignment(align);
  };

  // Resize handler to keep toggler within view and preserve its edge alignment.
  useEffect(() => {
    const handleResize = () => {
      if (buttonRef.current) {
        const { width, height } = buttonRef.current.getBoundingClientRect();
        const windowWidth = window.innerWidth;
        const windowHeight = window.innerHeight;
        let newX: number;
        if (alignment === "left") {
          newX = margin;
        } else {
          newX = windowWidth - width - margin;
        }
        const newY = Math.min(Math.max(position.y, margin), windowHeight - height - margin);
        const newPos = { x: newX, y: newY };
        setPosition(newPos);
        savePosition(newPos, alignment);
      }
    };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, [alignment, margin, position.y]);

  // Pointer event handlers.
  const handlePointerDown = (e: React.PointerEvent) => {
    isDragging.current = true;
    dragOffset.current = { x: e.clientX - position.x, y: e.clientY - position.y };
    (e.target as Element).setPointerCapture(e.pointerId);
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    if (!isDragging.current) return;
    const newX = e.clientX - dragOffset.current.x;
    const newY = e.clientY - dragOffset.current.y;
    setPosition({ x: newX, y: newY });
  };

  const handlePointerUp = (e: React.PointerEvent) => {
    isDragging.current = false;
    if (buttonRef.current) {
      const { width, height } = buttonRef.current.getBoundingClientRect();
      const windowWidth = window.innerWidth;
      const windowHeight = window.innerHeight;
      const newX = position.x + width / 2 < windowWidth / 2 ? margin : windowWidth - width - margin;
      const newAlign = newX === margin ? "left" : "right";
      const newY = Math.min(Math.max(position.y, margin), windowHeight - height - margin);
      const newPos = { x: newX, y: newY };
      setPosition(newPos);
      savePosition(newPos, newAlign);
    }
  };

  const handleButtonClick = () => {
    if (!isDragging.current) setIsModalOpen(true);
  };

  // Handler to send a message and call the AI helper.
  const handleSendMessage = async () => {
    if (!userInput.trim() || loading) return;
    const messageText = userInput.trim();
    setMessages((prev) => [...prev, { sender: "user", text: messageText }]);
    setUserInput("");
    setLoading(true);
    try {
      const history = messages.map((msg) => ({
        role: msg.sender,
        parts: [{ text: msg.text }],
      }));
      history.push({ role: "user", parts: [{ text: messageText }] });
      const response = await chatWithCollabifyAI(history, messageText);
      setMessages((prev) => [...prev, { sender: "model", text: response }]);
    } catch (error) {
      console.error(error);
      setMessages((prev) => [
        ...prev,
        { sender: "model", text: "Error: Unable to get a response." },
      ]);
    } finally {
      setLoading(false);
    }
  };

  // Handler to clear the conversation.
  const handleClearConversation = () => {
    setMessages([]);
    localStorage.removeItem("draggableChatbotMessages");
  };

  return (
    <>
      {/* Draggable Chatbot Toggler */}
      <div
        ref={buttonRef}
        className="fixed z-50 cursor-pointer"
        style={{ left: position.x, top: position.y }}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onClick={handleButtonClick}
      >
        <Button className="p-3 rounded-full bg-black text-white shadow-[0_0_10px_rgba(255,255,255,0.5)] transition-transform duration-200 hover:scale-110 hover:shadow-[0_0_20px_rgba(255,255,255,0.7)] hover:bg-white hover:text-black cursor-pointer focus:outline-none">
          <MessageSquare className="w-6 h-6" />
        </Button>
      </div>

      {/* Modal Overlay (z-index higher than toggler) - clicking outside the Card closes the modal */}
      <AnimatePresence>
        {isModalOpen && (
          <motion.div
            onClick={() => setIsModalOpen(false)}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-60 flex items-center justify-center bg-black bg-opacity-20"
          >
            <MotionCard
              onClick={(e) => e.stopPropagation()}
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="w-full max-w-lg rounded-xl shadow-2xl relative overflow-hidden bg-black"
            >
              <CardContent className="p-6 pt-0 pb-0">
                {/* Close Button */}
                <button
                  className="absolute top-3 right-3 p-1 rounded-full text-white transition-all duration-200 hover:scale-110 hover:shadow-2xl hover:bg-white hover:text-black cursor-pointer focus:outline-none"
                  onClick={() => setIsModalOpen(false)}
                >
                  <X className="w-6 h-6" />
                </button>
                <h2 className="text-2xl font-bold text-white mb-1">{t("collabifyAssistant")}</h2>
                <p className="text-sm text-gray-300 mb-4">{t("collabifyAssistantDesc")}</p>
                {/* Chat Messages Container */}
                <div className="h-72 overflow-y-auto border border-white p-4 mb-4 rounded-xl shadow-inner bg-black">
                  {messages.length === 0 && !loading ? (
                    <p className="text-white text-center">{t("typeSomething")}</p>
                  ) : (
                    <>
                      {messages.map((msg, idx) => (
                        <motion.div
                          key={idx}
                          variants={bubbleVariants}
                          initial="hidden"
                          animate="visible"
                          exit={{ opacity: 0, y: -10 }}
                          className={`mb-3 transition-all duration-200 ${
                            msg.sender === "user" ? "flex justify-end" : "flex justify-start"
                          }`}
                        >
                          <div
                            className={`px-4 py-2 pb-0 rounded-xl max-w-xs break-words overflow-x-auto transition-all duration-200 ${
                              msg.sender === "user"
                                ? "bg-white text-black shadow-lg hover:shadow-[0_0_20px_rgba(255,255,255,0.7)]"
                                : "bg-black text-white shadow-[0_0_10px_rgba(255,255,255,0.5)] hover:shadow-[0_0_20px_rgba(255,255,255,0.7)]"
                            }`}
                          >
                            <ReactMarkdown
                              remarkPlugins={[remarkGfm]}
                              components={
                                msg.sender === "user"
                                  ? userMarkdownComponents
                                  : modelMarkdownComponents
                              }
                            >
                              {msg.text}
                            </ReactMarkdown>
                          </div>
                        </motion.div>
                      ))}
                      {loading && (
                        <motion.div
                          variants={bubbleVariants}
                          initial="hidden"
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: -10 }}
                          className="flex justify-start mb-3 transition-all duration-200 hover:shadow-[0_0_20px_rgba(255,255,255,0.7)] shadow-[0_0_10px_rgba(255,255,255,0.5)] px-4 py-2 rounded-xl max-w-xs break-words text-white"
                        >
                          <Loader2 className="animate-spin w-5 h-5" />
                          <span className="ml-2">Thinking…</span>
                        </motion.div>
                      )}
                    </>
                  )}
                </div>

                {/* Input & Send Row */}
                <div className="flex gap-2 mb-2">
                  <input
                    type="text"
                    value={userInput}
                    onChange={(e) => setUserInput(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        e.preventDefault();
                        handleSendMessage();
                      }
                    }}
                    className="flex-1 h-12 p-3 rounded-xl bg-black text-white border border-white focus:outline-none focus:border-white transition-all duration-200 hover:bg-white hover:text-black overflow-x-auto"
                    placeholder={t("typeMessage")}
                  />
                  <Button
                    onClick={handleSendMessage}
                    disabled={loading}
                    className="h-12 p-3 rounded-xl bg-black text-white border border-white transition-all duration-200 hover:bg-white hover:text-black cursor-pointer"
                  >
                    {loading ? (
                      <Loader2 className="animate-spin w-5 h-5" />
                    ) : (
                      <div className="flex items-center gap-2">
                        <Send className="w-5 h-5" />
                        <span>{t("send")}</span>
                      </div>
                    )}
                  </Button>
                </div>
                {/* Clear Conversation Button */}
                <div className="flex justify-center">
                  <Button
                    onClick={handleClearConversation}
                    className="flex items-center gap-2 p-2 rounded-xl bg-black text-white border border-white transition-all duration-200 hover:bg-white hover:text-black cursor-pointer"
                  >
                    <Trash2 className="w-5 h-5" />
                    <span>{t("clearConversation")}</span>
                  </Button>
                </div>
              </CardContent>
            </MotionCard>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default DraggableChatbot;
