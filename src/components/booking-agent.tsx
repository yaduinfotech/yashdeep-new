import { useEffect, useRef, useState } from "react";
import { ClientOnly, Link } from "@tanstack/react-router";
import { useChat } from "@ai-sdk/react";
import { DefaultChatTransport, isToolUIPart, type UIMessage } from "ai";
import { ArrowRight, Phone, MessageCircle, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Conversation,
  ConversationContent,
  ConversationScrollButton,
} from "@/components/ai-elements/conversation";
import { Message, MessageContent, MessageResponse } from "@/components/ai-elements/message";
import {
  PromptInput,
  PromptInputTextarea,
  PromptInputFooter,
  PromptInputSubmit,
} from "@/components/ai-elements/prompt-input";
import {
  Tool,
  ToolHeader,
  ToolContent,
  ToolInput,
  ToolOutput,
} from "@/components/ai-elements/tool";
import { Reasoning, ReasoningTrigger, ReasoningContent } from "@/components/ai-elements/reasoning";
import { Shimmer } from "@/components/ai-elements/shimmer";
import { hotel, images, localToday, type Stay } from "@/lib/hotel";
import { BOOKING_CHAT_STORAGE_KEY, prepareAgentStay } from "@/lib/booking-agent-rules";

type AgentProps = { onReview?: (stay: Stay) => void; compact?: boolean };
export function BookingAgent(props: AgentProps) {
  return (
    <ClientOnly fallback={<p>Opening your booking concierge…</p>}>
      <SavedBookingAgent {...props} />
    </ClientOnly>
  );
}

function SavedBookingAgent(props: AgentProps) {
  const [initial, setInitial] = useState<UIMessage[] | null>(null);
  useEffect(() => {
    try {
      const saved = JSON.parse(localStorage.getItem(BOOKING_CHAT_STORAGE_KEY) ?? "[]");
      setInitial(
        Array.isArray(saved) &&
          saved.every(
            (m) =>
              typeof m.id === "string" &&
              ["user", "assistant"].includes(m.role) &&
              Array.isArray(m.parts),
          )
          ? saved
          : [],
      );
    } catch {
      setInitial([]);
    }
  }, []);
  return initial ? (
    <AgentChat initial={initial} {...props} />
  ) : (
    <p>Opening your booking concierge…</p>
  );
}

function AgentChat({ initial, onReview, compact }: { initial: UIMessage[] } & AgentProps) {
  const [text, setText] = useState("");
  const [notice, setNotice] = useState("");
  const input = useRef<HTMLTextAreaElement>(null);
  const { messages, sendMessage, setMessages, status, stop, clearError } = useChat({
    id: "yashdeep-booking",
    messages: initial,
    transport: new DefaultChatTransport({
      api: "/api/booking-agent",
      fetch: async (url, init) => {
        const response = await fetch(url, init);
        if (!response.ok) {
          const body = await response.json().catch(() => null);
          throw new Error(
            body?.error ?? "The assistant is unavailable. Please try again or call reception.",
          );
        }
        return response;
      },
    }),
    onError: (error) => setNotice(error.message),
    onFinish: ({ messages: completed }) => {
      try {
        localStorage.setItem(BOOKING_CHAT_STORAGE_KEY, JSON.stringify(completed));
      } catch {
        setNotice("This browser could not save your conversation.");
      }
    },
  });
  const busy = status === "submitted" || status === "streaming";
  useEffect(() => {
    if (!busy) {
      try {
        localStorage.setItem(BOOKING_CHAT_STORAGE_KEY, JSON.stringify(messages));
      } catch {
        setNotice("This browser could not save your conversation.");
      }
      if (
        !document.querySelector('[role="dialog"]') &&
        (!document.activeElement ||
          document.activeElement === document.body ||
          document.activeElement === input.current)
      )
        input.current?.focus();
    }
  }, [messages, busy]);
  function send(value: string) {
    if (!value.trim() || busy) return;
    setNotice("");
    clearError();
    setText("");
    void sendMessage({ text: value.trim() });
    input.current?.focus();
  }
  function clear() {
    if (busy || !window.confirm("Clear this booking conversation from this browser?")) return;
    setMessages([]);
    setNotice("");
    clearError();
    localStorage.removeItem(BOOKING_CHAT_STORAGE_KEY);
    input.current?.focus();
  }
  return (
    <div className={`agent-layout ${compact ? "agent-compact" : ""}`}>
      <div className="agent-chat">
        <div className="agent-chat-heading">
          <div>
            <span className="eyebrow">Yashdeep Palace</span>
            <h2>Your booking concierge</h2>
          </div>
          <Button
            variant="ghost"
            size="icon"
            title="Clear conversation"
            aria-label="Clear conversation"
            onClick={clear}
            disabled={busy}
          >
            <Trash2 />
          </Button>
        </div>
        <Conversation className="agent-transcript">
          <ConversationContent>
            {!messages.length && (
              <div className="agent-welcome">
                <h3>Let’s plan your stay.</h3>
                <p>When would you like to arrive, and how many guests are travelling?</p>
                <div className="agent-suggestions">
                  {[
                    "What room types can I request?",
                    "Help me plan a two-night stay",
                    "How do I contact reception?",
                  ].map((label) => (
                    <Button key={label} variant="outline" onClick={() => send(label)}>
                      {label}
                      <ArrowRight />
                    </Button>
                  ))}
                </div>
              </div>
            )}
            {messages.map((message) => (
              <Message key={message.id} from={message.role}>
                <MessageContent
                  className={
                    message.role === "user" ? "agent-user-message" : "agent-assistant-message"
                  }
                >
                  {message.parts.map((part, index) => {
                    if (part.type === "text")
                      return <MessageResponse key={index}>{part.text}</MessageResponse>;
                    if (part.type === "reasoning")
                      return (
                        <Reasoning
                          key={index}
                          defaultOpen={false}
                          isStreaming={busy && message === messages.at(-1)}
                        >
                          <ReasoningTrigger />
                          <ReasoningContent>{part.text}</ReasoningContent>
                        </Reasoning>
                      );
                    if (isToolUIPart(part)) {
                      const draft =
                        part.state === "output-available" &&
                        part.output &&
                        typeof part.output === "object" &&
                        "stay" in part.output
                          ? prepareAgentStay(part.output.stay, localToday())
                          : null;
                      return (
                        <div key={index}>
                          <Tool defaultOpen={false}>
                            {part.type === "dynamic-tool" ? (
                              <ToolHeader
                                type={part.type}
                                toolName={part.toolName}
                                state={part.state}
                                title="Booking concierge action"
                              />
                            ) : (
                              <ToolHeader
                                type={part.type}
                                state={part.state}
                                title={
                                  part.type === "tool-hotelInformation"
                                    ? "Hotel listing information"
                                    : "Prepare stay draft"
                                }
                              />
                            )}
                            <ToolContent>
                              <ToolInput input={part.input} />
                              <ToolOutput output={part.output} errorText={part.errorText} />
                            </ToolContent>
                          </Tool>
                          {draft?.ok && (
                            <div className="agent-stay-draft">
                              <h3>Your stay draft</h3>
                              <p>
                                {draft.stay.checkIn} → {draft.stay.checkOut}
                              </p>
                              <p>
                                {draft.stay.adults} adults · {draft.stay.children} children ·{" "}
                                {draft.stay.rooms} rooms
                              </p>
                              <p>{draft.stay.room || "No room preference"}</p>
                              {onReview ? (
                                <Button variant="hotel" onClick={() => onReview(draft.stay)}>
                                  Continue with this stay
                                  <ArrowRight />
                                </Button>
                              ) : (
                                <Button variant="hotel" asChild>
                                  <Link to="/booking" search={draft.stay}>
                                    Review in booking form
                                    <ArrowRight />
                                  </Link>
                                </Button>
                              )}
                              <p className="rate-note mt-3">
                                Not a reservation. Email and mobile verification are required.
                              </p>
                            </div>
                          )}
                        </div>
                      );
                    }
                    return null;
                  })}
                </MessageContent>
              </Message>
            ))}
            {busy && (
              <div role="status">
                <Shimmer>Concierge is thinking…</Shimmer>
              </div>
            )}
          </ConversationContent>
          <ConversationScrollButton />
        </Conversation>
        <div className="agent-composer">
          {notice && (
            <p role="alert" className="form-error">
              {notice}
            </p>
          )}
          <PromptInput onSubmit={() => send(text)}>
            <PromptInputTextarea
              ref={input}
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder="Tell us your dates and number of guests…"
              aria-label="Message booking concierge"
              maxLength={4000}
            />
            <PromptInputFooter className="justify-end">
              <PromptInputSubmit
                status={status}
                onStop={() => {
                  void stop();
                  input.current?.focus();
                }}
                disabled={!busy && !text.trim()}
              />
            </PromptInputFooter>
          </PromptInput>
          <p className="rate-note mt-3">
            Saved in this browser. Don’t share passwords, payment details or verification codes.
          </p>
        </div>
      </div>
      <aside className="booking-aside agent-aside">
        <img src={images.reception} alt="Yashdeep Palace reception" />
        <h2>A personal welcome.</h2>
        <p>Reception confirms prices, availability and booking terms.</p>
        <div className="aside-actions">
          <Button variant="outline" asChild>
            <a href={hotel.phoneLink}>
              <Phone />
              Call front desk {hotel.phone} / {hotel.phone2}
            </a>
          </Button>
          <Button variant="outline" asChild>
            <a href={hotel.whatsapp} target="_blank" rel="noreferrer">
              <MessageCircle />
              WhatsApp front desk
            </a>
          </Button>
        </div>
        <div className="policy-note">
          Email and mobile verification are required in the booking form. Chat drafts do not reserve
          a room.
        </div>
        <Button variant="ghost" asChild>
          <Link to="/booking">
            Booking form
            <ArrowRight />
          </Link>
        </Button>
      </aside>
    </div>
  );
}
