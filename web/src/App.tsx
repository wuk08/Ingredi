import { Navigate, Route, Routes, useLocation } from "react-router-dom";
import { TabBar } from "./components/TabBar";
import { AddIngredient } from "./screens/AddIngredient";
import { Chat } from "./screens/Chat";
import { Cook } from "./screens/Cook";
import { GroupChat } from "./screens/GroupChat";
import { Home } from "./screens/Home";
import { Login } from "./screens/Login";
import { MealSwap } from "./screens/MealSwap";
import { Messages } from "./screens/Messages";
import { My } from "./screens/My";
import { MyFridge } from "./screens/MyFridge";
import { MyPosts } from "./screens/MyPosts";
import { Nearby } from "./screens/Nearby";
import { Notifications } from "./screens/Notifications";
import { Post } from "./screens/Post";
import { PostDone } from "./screens/PostDone";
import { Recipe } from "./screens/Recipe";
import { ScanCamera } from "./screens/ScanCamera";
import { ScanDone } from "./screens/ScanDone";
import { ScanReview } from "./screens/ScanReview";
import { Shared } from "./screens/Shared";
import { TokenBuy } from "./screens/TokenBuy";
import { UploadPost } from "./screens/UploadPost";
import { CommunityDialogs } from "./components/CommunityDialogs";
import { useAppState } from "./data/AppState";

const tabRoots = ["/home", "/cook", "/nearby", "/messages", "/my"];

export function App() {
  const { pathname } = useLocation();
  const { error, clearError, notice, loading } = useAppState();
  return (
    <div className="phone">
      {loading && <div className="app-loading" role="status">Opening your kitchen…</div>}
      {error && <div className="app-banner app-banner--error" role="alert"><span>{error}</span><button type="button" onClick={clearError}>Dismiss</button></div>}
      {!error && notice && <div className="app-banner" role="status">{notice}</div>}
      <Routes>
        <Route path="/" element={<Login />} />
        {/* Tabs */}
        <Route path="/home" element={<Home />} />
        <Route path="/cook" element={<Cook />} />
        <Route path="/nearby" element={<Nearby />} />
        <Route path="/messages" element={<Messages />} />
        <Route path="/my" element={<My />} />
        <Route path="/my/posts" element={<MyPosts />} />
        {/* Cook flow */}
        <Route path="/recipe" element={<Recipe />} />
        <Route path="/recipe/:id" element={<Recipe />} />
        <Route path="/meal-swap" element={<MealSwap />} />
        <Route path="/meal-swap/:id" element={<MealSwap />} />
        <Route path="/fridge" element={<MyFridge />} />
        <Route path="/fridge/add" element={<AddIngredient />} />
        <Route path="/scan" element={<ScanCamera />} />
        <Route path="/scan/review" element={<ScanReview />} />
        <Route path="/scan/done" element={<ScanDone />} />
        {/* Share flow */}
        <Route path="/post" element={<Post />} />
        <Route path="/post/:id" element={<Post />} />
        <Route path="/post/new" element={<UploadPost />} />
        <Route path="/post/done" element={<PostDone />} />
        <Route path="/chat" element={<Chat />} />
        <Route path="/chat/:id" element={<Chat />} />
        <Route path="/chat/group" element={<GroupChat />} />
        <Route path="/chat/group/:id" element={<GroupChat />} />
        <Route path="/shared" element={<Shared />} />
        <Route path="/shared/:id" element={<Shared />} />
        {/* Account */}
        <Route path="/notifications" element={<Notifications />} />
        <Route path="/tokens" element={<TokenBuy />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
      {tabRoots.includes(pathname) && <TabBar />}
      <CommunityDialogs />
    </div>
  );
}
