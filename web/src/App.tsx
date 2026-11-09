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

const tabRoots = ["/home", "/cook", "/nearby", "/messages", "/my"];

export function App() {
  const { pathname } = useLocation();
  return (
    <div className="phone">
      <Routes>
        <Route path="/" element={<Login />} />
        {/* Tabs */}
        <Route path="/home" element={<Home />} />
        <Route path="/cook" element={<Cook />} />
        <Route path="/nearby" element={<Nearby />} />
        <Route path="/messages" element={<Messages />} />
        <Route path="/my" element={<My />} />
        {/* Cook flow */}
        <Route path="/recipe" element={<Recipe />} />
        <Route path="/recipe/:id" element={<Recipe />} />
        <Route path="/meal-swap" element={<MealSwap />} />
        <Route path="/fridge/add" element={<AddIngredient />} />
        <Route path="/scan" element={<ScanCamera />} />
        <Route path="/scan/review" element={<ScanReview />} />
        <Route path="/scan/done" element={<ScanDone />} />
        {/* Share flow */}
        <Route path="/post" element={<Post />} />
        <Route path="/post/new" element={<UploadPost />} />
        <Route path="/post/done" element={<PostDone />} />
        <Route path="/chat" element={<Chat />} />
        <Route path="/chat/group" element={<GroupChat />} />
        <Route path="/shared" element={<Shared />} />
        {/* Account */}
        <Route path="/notifications" element={<Notifications />} />
        <Route path="/tokens" element={<TokenBuy />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
      {tabRoots.includes(pathname) && <TabBar />}
    </div>
  );
}
