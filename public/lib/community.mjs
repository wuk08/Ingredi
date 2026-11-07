import { localDate } from "./domain.mjs";
function seedCommunity(now = /* @__PURE__ */ new Date()) {
  const people = { you: { name: "Jason Park", city: "Ann Arbor, MI" }, jack: { name: "Jack Lee", distance: 0.2 }, mason: { name: "Mason Mei", distance: 0.4 }, ari: { name: "Ari Kim", distance: 0.6 }, dana: { name: "Dana P.", distance: 0.8 }, leo: { name: "Leo S.", distance: 0.9 } };
  const post = (id, owner, title, type, category, offer, distance, food, quantity = 1) => ({ id, owner, title, type, category, offer, distance, food, quantity, unit: "item", description: "A little extra to share with the neighborhood. Happy to hand off at my building lobby.", pickup: "Today, 5–8 PM · building lobby", expires_on: localDate(3), status: "active", photos: [], created_at: now.toISOString() });
  return {
    version: 1,
    people,
    profile: { display_name: "Jason Park", city: "Ann Arbor, MI" },
    preferences: [],
    saved: [],
    draft: null,
    posts: [post("avocados", "jack", "Anyone wants free avocados?", "available", "ingredients", "free", 0.2, "Avocado", 3), post("eggs", "mason", "I need two eggs!", "wanted", "ingredients", "exchange", 0.4, "Eggs", 2), { ...post("korean", "ari", "Korean Food Week · 1 spot", "meal_prep", "meals", "free", 0.6, "Bibimbap"), groupId: "korean-week" }, post("cooker", "dana", "Lending a rice cooker", "available", "equipment", "free", 0.8, "Rice cooker"), post("basil", "leo", "Looking for fresh basil", "wanted", "ingredients", "exchange", 0.9, "Basil"), post("carrots", "you", "Extra carrots from my market haul", "available", "ingredients", "free", 0.1, "Carrot", 4)],
    groups: [
      { id: "korean-week", title: "Korean Food Week", description: "Cook one dish at home, swap portions, take home 4 different meals.", date: localDate(2), time: "5 PM", location: "Ann Arbor Library lobby", capacity: 4, members: [{ person: "jack", dish: "Bibimbap", host: true }, { person: "mason", dish: "Spicy pork" }, { person: "ari", dish: "Kimchi fried rice" }], dishes: ["Bibimbap", "Spicy pork", "Kimchi fried rice", "Kimchi jjigae"] },
      { id: "veggie-batch", title: "Veggie Batch Club", description: "A Sunday batch of bright vegetable dishes, shared with neighbors.", date: localDate(3), time: "4 PM", location: "Community garden entrance", capacity: 4, members: [{ person: "dana", dish: "Golden vegetable curry", host: true }, { person: "leo", dish: "Roast vegetables" }], dishes: ["Golden vegetable curry", "Roast vegetables", "Vegetable soup", "Chickpea salad"] }
    ],
    conversations: [{ id: "share-carrots", postId: "carrots", person: "jack", groupId: null, unread: 1, messages: [{ id: "seed-message", sender: "jack", text: "Hi! Are the carrots still available? I can pick them up around 6.", at: now.toISOString() }] }],
    completions: [],
    ratings: {},
    impact: { points: 1240, shares: 18, meals: 27, savings: 86 }
  };
}
function filterPosts(posts, { search = "", type = "all", category = "all", offer = "all", distance = 1, own = false } = {}) {
  const query = search.trim().toLowerCase();
  return posts.filter((p) => (own ? p.owner === "you" : p.status === "active" || p.status === "reserved") && (!query || `${p.title} ${p.description} ${p.food}`.toLowerCase().includes(query)) && (type === "all" || p.type === type) && (category === "all" || p.category === category) && (offer === "all" || p.offer === offer) && p.distance <= Number(distance)).sort((a, b) => a.distance - b.distance);
}
const uid = () => globalThis.crypto.randomUUID();
const timestamp = () => (/* @__PURE__ */ new Date()).toISOString();
function findPost(data, id) {
  const post = data.posts.find((p) => p.id === id);
  if (!post) throw new Error("This demo post is no longer available.");
  return post;
}
function ensureConversation(data, post, person) {
  let chat = data.conversations.find((c) => c.postId === post.id);
  if (!chat) {
    chat = { id: uid(), postId: post.id, person, groupId: null, unread: 0, messages: [] };
    data.conversations.unshift(chat);
  }
  return chat;
}
const actions = {
  saveDraft(data, draft) {
    data.draft = draft;
    return null;
  },
  publish(data, draft) {
    if (!draft.title?.trim() || draft.title.trim().length > 120) throw new Error("Add a title of up to 120 characters.");
    if (!["available", "wanted", "meal_prep"].includes(draft.type) || !["ingredients", "meals", "equipment"].includes(draft.category) || !["free", "exchange"].includes(draft.offer)) throw new Error("Choose a post type, category, and offer.");
    if (!Number.isFinite(Number(draft.quantity)) || Number(draft.quantity) <= 0) throw new Error("Choose a quantity greater than zero.");
    if (!draft.pickup?.trim()) throw new Error("Add a pickup or meetup location and time.");
    const post = { ...draft, id: uid(), title: draft.title.trim(), description: draft.description?.trim() || "", quantity: Number(draft.quantity), owner: "you", distance: 0.1, status: "active", food: draft.title, created_at: timestamp(), photos: (draft.photos || []).slice(0, 5) };
    if (post.type === "meal_prep") {
      const dish = draft.dish?.trim() || "My dish";
      const group = { id: uid(), title: post.title, description: post.description || "Cook at home, then share a meal with your neighbors.", date: draft.date || localDate(2), time: draft.time || "5 PM", location: post.pickup, capacity: 4, members: [{ person: "you", dish, host: true }], dishes: [...new Set([dish, "Vegetable curry", "Rice bowl", "Seasonal salad", "Roast vegetables"])].slice(0, 4) };
      post.groupId = group.id;
      data.groups.unshift(group);
    } else {
      const chat = ensureConversation(data, post, "jack");
      chat.unread = 1;
      chat.messages.push({ id: uid(), sender: "jack", text: post.type === "wanted" ? "Hi! I have some to share. Would this evening work?" : "Hi! Is this still available? I could pick it up this evening.", at: timestamp() });
    }
    data.posts.unshift(post);
    data.draft = null;
    return post.id;
  },
  request(data, id) {
    const post = findPost(data, id);
    if (post.owner === "you") return ensureConversation(data, post, "jack").id;
    if (post.status === "completed" || post.status === "cancelled") throw new Error("This item is no longer available.");
    const chat = ensureConversation(data, post, post.owner);
    if (!chat.messages.length) {
      chat.messages.push({ id: uid(), sender: "you", text: post.type === "wanted" ? "Hi! I may be able to help with this." : "Hi! Is this still available? I would love to pick it up.", at: timestamp() }, { id: uid(), sender: post.owner, text: "Yes! The sample pickup is today, 5–8 PM at the lobby. What time works for you?", at: timestamp() });
    }
    post.status = "reserved";
    return chat.id;
  },
  read(data, id) {
    const chat = data.conversations.find((c) => c.id === id);
    if (chat) chat.unread = 0;
  },
  send(data, { id, text }) {
    const chat = data.conversations.find((c) => c.id === id);
    if (!chat) throw new Error("Conversation not found.");
    if (!text?.trim() || text.length > 2e3) throw new Error("Write a message of up to 2,000 characters.");
    chat.messages.push({ id: uid(), sender: "you", text: text.trim(), at: timestamp() });
    const person = chat.person || data.groups.find((g) => g.id === chat.groupId)?.members.find((m) => m.person !== "you")?.person;
    if (person) chat.messages.push({ id: uid(), sender: person, text: chat.groupId ? "Sounds good! Looking forward to the sample meal swap." : "That works for me! See you at the sample pickup.", at: timestamp() });
  },
  join(data, { id, dish }) {
    const group = data.groups.find((g) => g.id === id);
    if (!group) throw new Error("Group not found.");
    if (!group.members.some((m) => m.person === "you")) {
      if (group.members.length >= group.capacity) throw new Error("This group is full.");
      if (!group.dishes.includes(dish) || group.members.some((m) => m.dish === dish)) throw new Error("Choose an available dish.");
      group.members.push({ person: "you", dish });
    }
    let chat = data.conversations.find((c) => c.groupId === id);
    if (!chat) {
      chat = { id: uid(), groupId: id, postId: null, person: null, unread: 0, messages: [{ id: uid(), sender: group.members.find((m) => m.person !== "you")?.person || "you", text: "Welcome! Bring your dish in portions for everyone. This is a sample group conversation.", at: timestamp() }] };
      data.conversations.unshift(chat);
    }
    return chat.id;
  },
  complete(data, id) {
    const post = findPost(data, id);
    if (post.type === "meal_prep") throw new Error("Use the meal-swap group to coordinate this post.");
    if (data.completions.includes(id)) return id;
    if (post.status === "cancelled") throw new Error("This post was cancelled.");
    const ownerGives = post.owner === "you" && post.type === "available";
    const visitorGives = post.owner !== "you" && post.type === "wanted";
    post.status = "completed";
    data.completions.push(id);
    if (ownerGives || visitorGives) {
      data.impact.points += 50;
      data.impact.shares++;
      data.impact.meals++;
      data.impact.savings += 4;
    }
    return id;
  },
  rate(data, { id, rating }) {
    if (!data.completions.includes(id) || !Number.isInteger(rating) || rating < 1 || rating > 5) throw new Error("Choose a rating from 1 to 5 after completing the handoff.");
    data.ratings[id] = rating;
  },
  bookmark(data, key) {
    data.saved = data.saved.includes(key) ? data.saved.filter((k) => k !== key) : [...data.saved, key];
  },
  preferences(data, value) {
    data.preferences = [...value];
  },
  profile(data, value) {
    if (!value.display_name?.trim() || value.display_name.length > 80 || value.city?.length > 100) throw new Error("Enter a name of up to 80 characters and a city of up to 100 characters.");
    data.profile = { display_name: value.display_name.trim(), city: value.city?.trim() || "" };
    data.people.you.name = data.profile.display_name;
  },
  cancel(data, id) {
    const post = findPost(data, id);
    if (post.owner !== "you" || post.status === "completed") throw new Error("This post cannot be cancelled.");
    post.status = "cancelled";
  }
};
class IndexedDBStorage {
  constructor(factory = globalThis.indexedDB) {
    this.factory = factory;
  }
  open() {
    if (!this.database) this.database = new Promise((resolve, reject) => {
      if (!this.factory) {
        reject(new Error("Device storage is unavailable. Enable website storage to use the community demo."));
        return;
      }
      const request = this.factory.open("ingredi-community", 1);
      request.onupgradeneeded = () => request.result.createObjectStore("accounts");
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
    return this.database;
  }
  async update(scope, initial, mutate) {
    const db = await this.open();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction("accounts", "readwrite");
      const store = transaction.objectStore("accounts");
      const request = store.get(scope);
      let next, result, error;
      request.onsuccess = () => {
        try {
          next = request.result?.version === 1 ? request.result : initial();
          result = mutate(next);
          store.put(next, scope);
        } catch (e) {
          error = e;
          transaction.abort();
        }
      };
      transaction.oncomplete = () => resolve({ data: next, result });
      transaction.onabort = transaction.onerror = () => reject(error || transaction.error || new Error("Could not save the demo on this device."));
    });
  }
}
class DemoRepository {
  constructor(scope, storage = new IndexedDBStorage()) {
    this.scope = scope;
    this.storage = storage;
    this.data = null;
  }
  async load() {
    const saved = await this.storage.update(this.scope, seedCommunity, () => {
    });
    this.data = saved.data;
    return this.data;
  }
  async run(action, value) {
    if (!actions[action]) throw new Error("Unknown demo action.");
    const saved = await this.storage.update(this.scope, seedCommunity, (data) => actions[action](data, value));
    this.data = saved.data;
    return saved.result;
  }
  async reset() {
    const saved = await this.storage.update(this.scope, seedCommunity, (data) => {
      for (const key of Object.keys(data)) delete data[key];
      Object.assign(data, seedCommunity());
    });
    this.data = saved.data;
  }
}
export {
  DemoRepository,
  IndexedDBStorage,
  actions,
  filterPosts,
  seedCommunity
};
