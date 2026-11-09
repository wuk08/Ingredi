import { useState } from "react";
import { Link } from "react-router-dom";
import { Avatar } from "../components/Avatar";
import { useAppState } from "../data/AppState";

export function Messages() {
  const { community, setupReady, setDialog } = useAppState();
  const [tab, setTab] = useState<"dm" | "group">("dm");
  if (!setupReady) return <main className="center-gate"><h1 className="h1">Your neighborhood conversations</h1><p className="body">Set up your residence to restore your building inbox and group chats.</p><button className="btn btn--primary" onClick={() => setDialog("setup")}>Set up my residence</button></main>;
  const conversations = (community.conversations || []).filter((chat: any) => tab === "group" ? Boolean(chat.groupId) : !chat.groupId);
  return <>
    <header className="messages-header"><h1 className="h1">Messages</h1><div role="tablist" className="seg"><button role="tab" aria-selected={tab === "dm"} onClick={() => setTab("dm")}>1:1</button><button role="tab" aria-selected={tab === "group"} onClick={() => setTab("group")}>Group</button></div></header>
    <main className="screen-scroll messages-list">{conversations.map((chat: any) => {
      const group = chat.groupId ? community.groups.find((item: any) => item.id === chat.groupId) : null;
      const person = !group ? community.people?.[chat.person] : null;
      const post = chat.postId ? community.posts.find((item: any) => item.id === chat.postId) : null;
      const name = group?.title || person?.name || "Conversation";
      const last = chat.messages.at(-1);
      const members = group?.members.slice(0, 3).map((member: any) => community.people?.[member.person]?.name).filter(Boolean) || [];
      return <Link key={chat.id} to={group ? `/chat/group/${chat.id}` : `/chat/${chat.id}`} className="message-row">{group ? <span className="avatar-stack avatar-stack--message">{members.map((memberName: string) => <Avatar key={memberName} name={memberName} size={34} ring="var(--bg)" />)}</span> : <Avatar name={name} size={52} />}<span className="message-copy"><span className="message-title"><b>{name}</b><small>{last ? new Date(last.at).toLocaleTimeString([], { hour: "numeric", minute: "2-digit" }) : ""}</small></span><span className="caption">{post?.title || group?.location || "Neighborhood exchange"}</span><span className="message-last">{last?.text || "Start the conversation"}{chat.unread > 0 && <b className="unread-count">{chat.unread}</b>}</span></span></Link>;
    })}{!conversations.length && <div className="empty-state"><h2>No {tab === "group" ? "group " : ""}messages yet</h2><p>Request an item or join a meal prep group to start one.</p><Link to="/nearby" className="btn btn--primary">Browse nearby</Link></div>}</main>
  </>;
}
