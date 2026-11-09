import { useEffect, useMemo, useState, type FormEvent } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { Avatar } from "../components/Avatar";
import { ChatHeader } from "../components/ChatParts";
import { CheckIcon } from "../components/Icons";
import { useAppState } from "../data/AppState";

export function Chat({ groupOnly = false }: { groupOnly?: boolean }) {
  const { id } = useParams();
  const nav = useNavigate();
  const { community, runCommunity, ensureCommunity, busy } = useAppState();
  const [text, setText] = useState("");
  const chat = useMemo(() => (community.conversations || []).find((item: any) => item.id === id) || (community.conversations || []).find((item: any) => groupOnly ? item.groupId : !item.groupId), [community.conversations, groupOnly, id]);
  const group = chat?.groupId ? community.groups.find((item: any) => item.id === chat.groupId) : null;
  const post = chat?.postId ? community.posts.find((item: any) => item.id === chat.postId) : null;
  const person = !group && chat ? community.people?.[chat.person] : null;
  const groupMembers = group?.members.slice(0, 3).map((member: any) => community.people?.[member.person]?.name).filter(Boolean) || [];
  useEffect(() => { if (chat?.id && chat.unread) void runCommunity("read", chat.id).catch(() => undefined); }, [chat?.id]); // eslint-disable-line react-hooks/exhaustive-deps
  if (!chat) return <main className="center-gate"><h1 className="h1">Conversation not found</h1><p className="body">It may belong to another residence community.</p><Link to="/messages" className="btn btn--primary">Back to messages</Link></main>;
  const title = group?.title || person?.name || "Conversation";
  const send = async (event: FormEvent) => {
    event.preventDefault();
    if (!text.trim() || !ensureCommunity(true)) return;
    const value = text; setText("");
    try { await runCommunity("send", { id: chat.id, text: value }); } catch { setText(value); }
  };
  const complete = async () => {
    if (!post || !ensureCommunity(true)) return;
    await runCommunity("complete", post.id);
    nav(`/shared/${post.id}`);
  };
  return <>
    <ChatHeader title={title} sub={group ? `${group.members.length}/${group.capacity} members` : `${person?.distance ?? 0} mi away`} right={group ? <span className="avatar-stack avatar-stack--header">{groupMembers.map((name: string) => <Avatar key={name} name={name} size={30} ring="var(--bg)" />)}</span> : <Avatar name={title} size={38} />} />
    {(post || group) && <div className="card chat-context"><Link to={group ? `/meal-swap/${group.id}` : `/post/${post.id}`}><b>{group?.title || post.title}</b><span className="caption">{group ? `${group.date} · ${group.location}` : `${post.type === "wanted" ? "Wanted" : "Available"} · ${post.pickup}`}</span></Link>{post && post.type !== "meal_prep" && post.status !== "completed" && <button type="button" className="btn btn--primary btn--sm" disabled={busy} onClick={() => void complete()}><CheckIcon size={14} color="#fff" />Mark shared</button>}</div>}
    <main className="screen-scroll chat-scroll"><span className="caption chat-day">Today</span>{chat.messages.map((message: any) => { const mine = message.sender === "you"; const sender = community.people?.[message.sender]?.name || (mine ? "You" : "Neighbor"); return <div key={message.id} className={`chat-line${mine ? " chat-line--mine" : ""}`}>{group && !mine && <small>{sender}</small>}<span className="chat-message">{!mine && <Avatar name={sender} size={30} />}<span className={`bubble${mine ? " bubble--me" : ""}`}>{message.text}</span></span></div>; })}</main>
    <form className="composer" onSubmit={send}><input id="chat-text" aria-label="Message" value={text} onChange={(e) => setText(e.target.value)} maxLength={2000} placeholder="Message" /><button type="submit" aria-label="Send" disabled={busy || !text.trim()}>↑</button></form>
  </>;
}
