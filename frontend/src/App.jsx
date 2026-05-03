import { useEffect, useState, useCallback } from "react";
import Auth from "./Auth";
import EditProfile from "./EditProfile";
import Feed from "./Feed";
import LeftSidebar from "./LeftSidebar";
import RightSidebar from "./RightSidebar";

function App() {
  const [user, setUser] = useState(null);
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [posts, setPosts] = useState([]);
  const [newPost, setNewPost] = useState("");
  const [comments, setComments] = useState({});
  const [newComments, setNewComments] = useState({});
  const [email, setEmail] = useState("");
  const [isRegistering, setIsRegistering] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [postSearch, setPostSearch] = useState("");
  const [userSearch, setUserSearch] = useState("");
  const [friends, setFriends] = useState([]);
  const [allUsers, setAllUsers] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [profileFile, setProfileFile] = useState(null);
  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [isEditing, setIsEditing] = useState(false);

  async function loadPosts() {
    let url = `http://localhost:3000/posts?userId=${user.id}`;
    if (selectedUser) url += `&filterUserId=${selectedUser.id}`;
    const res = await fetch(url);
    const data = await res.json();
    setPosts(data);
    for (const post of data) loadComments(post.id);
  }

  const loadComments = useCallback(async (postId) => {
    const res = await fetch(`http://localhost:3000/comments/${postId}`);
    const data = await res.json();
    setComments((prev) => ({ ...prev, [postId]: data }));
  }, []);

  useEffect(() => {
    if (user) {
      loadPosts();
      loadFriends();
      loadUsers();
    }
  }, [user]);

  useEffect(() => {
    const saved = localStorage.getItem("remember");
    if (saved) {
      const { username } = JSON.parse(saved);
      setUsername(username);
      setRememberMe(true);
    }
  }, []);

  useEffect(() => {
    if (!user) return;
    const interval = setInterval(loadFriends, 3000);
    return () => clearInterval(interval);
  }, [user]);

  useEffect(() => {
    if (!user) return;
    const interval = setInterval(() => {
      fetch("http://localhost:3000/ping", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ user_id: user.id }),
      });
    }, 5000);
    return () => clearInterval(interval);
  }, [user]);

  useEffect(() => {
    if (!user || selectedUser) return;
    const interval = setInterval(loadPosts, 3000);
    return () => clearInterval(interval);
  }, [user, selectedUser]);

  useEffect(() => {
    if (!user) return;
    const interval = setInterval(loadUsers, 5000);
    return () => clearInterval(interval);
  }, [user]);

  useEffect(() => {
    if (user) loadPosts();
  }, [user, selectedUser]);

  useEffect(() => {
    if (user) {
      setUsername(user.username);
      setEmail(user.email || "");
    }
  }, [user]);

  async function login(username, password) {
    const res = await fetch("http://localhost:3000/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username, password }),
    });
    if (!res.ok) return alert("Invalid username or password");
    const data = await res.json();
    setUser(data);
  }

  async function register(username, password, email) {
    const formData = new FormData();
    formData.append("username", username);
    formData.append("password", password);
    formData.append("email", email);
    if (profileFile) formData.append("profile_picture", profileFile);

    await fetch("http://localhost:3000/users", {
      method: "POST",
      body: formData,
    });
    login(username, password);
  }

  async function createPost() {
    if (!newPost.trim()) return;
    await fetch("http://localhost:3000/posts", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ user_id: user.id, content: newPost }),
    });
    setNewPost("");
    loadPosts();
  }

  async function likePost(postId) {
    await fetch("http://localhost:3000/likes", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ post_id: postId, user_id: user.id }),
    });
    loadPosts();
  }

  async function loadFriends() {
    const res = await fetch(`http://localhost:3000/friends/${user.id}`);
    setFriends(await res.json());
  }

  async function loadUsers() {
    const res = await fetch("http://localhost:3000/users");
    setAllUsers(await res.json());
  }

  async function addFriend(friendId) {
    await fetch("http://localhost:3000/friends", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ user_id: user.id, friend_id: friendId }),
    });
    loadFriends();
  }

  async function removeFriend(friendId) {
    await fetch("http://localhost:3000/friends", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ user_id: user.id, friend_id: friendId }),
    });
    loadFriends();
  }

  async function addComment(postId) {
    await fetch("http://localhost:3000/comments", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        post_id: postId,
        user_id: user.id,
        content: newComments[postId],
      }),
    });
    setNewComments((prev) => ({ ...prev, [postId]: "" }));
    loadPosts();
  }

  function handleSubmit() {
    if (isRegistering) {
      register(username, password, email);
    } else {
      if (rememberMe) {
        localStorage.setItem("remember", JSON.stringify({ username }));
      } else {
        localStorage.removeItem("remember");
      }
      login(username, password);
    }
  }

  async function logout() {
    await fetch("http://localhost:3000/logout", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ user_id: user.id }),
    });

    setUser(null);
    setIsRegistering(false);
    if (!rememberMe) setUsername("");
    setPassword("");
    setEmail("");
  }

  async function updateProfile() {
    const formData = new FormData();
    formData.append("username", username);
    formData.append("email", email);

    if (oldPassword && newPassword) {
      formData.append("oldPassword", oldPassword);
      formData.append("newPassword", newPassword);
    } else if (oldPassword || newPassword) {
      alert("Du skal udfylde både gammel og ny adgangskode");
      return;
    }

    if (profileFile) formData.append("profile_picture", profileFile);

    const res = await fetch(`http://localhost:3000/users/${user.id}`, {
      method: "PUT",
      body: formData,
    });

    if (!res.ok) {
      const err = await res.json();
      return alert(err.error || "Error updating profile");
    }

    const updatedUser = await res.json();

    setUser((prev) => ({ ...prev, ...updatedUser }));
    setOldPassword("");
    setNewPassword("");
    setProfileFile(null);
    setIsEditing(false);

    alert("Profil opdateret ✅");
  }

  function timeAgo(dateString) {
    const date = new Date(dateString.replace(" ", "T") + "Z");
    const diff = Math.floor((new Date() - date) / 1000);
    if (diff < 10) return "Just now";
    if (diff < 60) return diff + " sec ago";
    if (diff < 3600) return Math.floor(diff / 60) + " min ago";
    if (diff < 86400) return Math.floor(diff / 3600) + " h ago";
    return Math.floor(diff / 86400) + " days ago";
  }

  function highlightMatch(text, search) {
    if (!search) return text;
    const regex = new RegExp(`(${search})`, "gi");
    return text.split(regex).map((part, i) =>
      part.toLowerCase() === search.toLowerCase() ? (
        <span
          key={i}
          style={{
            backgroundColor: "#bae6fd",
            borderRadius: "4px",
            padding: "0 2px",
          }}
        >
          {part}
        </span>
      ) : (
        part
      ),
    );
  }

  if (user && isEditing) {
    return (
      <EditProfile
        username={username}
        setUsername={setUsername}
        email={email}
        setEmail={setEmail}
        oldPassword={oldPassword}
        setOldPassword={setOldPassword}
        newPassword={newPassword}
        setNewPassword={setNewPassword}
        setProfileFile={setProfileFile}
        updateProfile={updateProfile}
        setIsEditing={setIsEditing}
      />
    );
  }

  if (!user) {
    return (
      <Auth
        username={username}
        setUsername={setUsername}
        password={password}
        setPassword={setPassword}
        email={email}
        setEmail={setEmail}
        isRegistering={isRegistering}
        setIsRegistering={setIsRegistering}
        rememberMe={rememberMe}
        setRememberMe={setRememberMe}
        setProfileFile={setProfileFile}
        handleSubmit={handleSubmit}
      />
    );
  }

  return (
    <div
      style={{
        display: "grid",
        gridTemplateColumns: "250px 1fr 250px",
        minHeight: "100vh",
        background: "#f0fdf4",
      }}
    >
      <LeftSidebar user={user} logout={logout} setIsEditing={setIsEditing} />

      <Feed
        posts={posts}
        postSearch={postSearch}
        setPostSearch={setPostSearch}
        newPost={newPost}
        setNewPost={setNewPost}
        createPost={createPost}
        likePost={likePost}
        comments={comments}
        newComments={newComments}
        setNewComments={setNewComments}
        addComment={addComment}
        timeAgo={timeAgo}
        selectedUser={selectedUser}
        setSelectedUser={setSelectedUser}
      />

      <RightSidebar
        friends={friends}
        selectedUser={selectedUser}
        setSelectedUser={setSelectedUser}
        removeFriend={removeFriend}
        userSearch={userSearch}
        setUserSearch={setUserSearch}
        allUsers={allUsers}
        addFriend={addFriend}
        highlightMatch={highlightMatch}
        user={user}
      />
    </div>
  );
}

export default App;
