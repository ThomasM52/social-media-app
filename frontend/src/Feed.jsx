function Feed({
  posts,
  postSearch,
  setPostSearch,
  newPost,
  setNewPost,
  createPost,
  likePost,
  comments,
  newComments,
  setNewComments,
  addComment,
  timeAgo,
  selectedUser,
  setSelectedUser,
}) {
  return (
    <div style={{ padding: "20px", maxWidth: "350px", margin: "0 auto" }}>
      <div
        style={{
          position: "sticky",
          top: 0,
          zIndex: 1000,
          background: "#1877f2",
          color: "white",
          padding: "12px 20px",
          marginBottom: "20px",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          boxShadow: "0 2px 5px rgba(0,0,0,0.1)",
        }}
      >
        <span style={{ fontWeight: "bold", fontSize: "20px" }}>
          Christian&Thomas
        </span>
      </div>

      <h1 style={{ textAlign: "center" }}>Feed</h1>

      {selectedUser && (
        <div style={{ marginBottom: "10px" }}>
          <b>Showing posts from: {selectedUser.username}</b>

          <button
            style={{ marginLeft: "10px" }}
            onClick={() => setSelectedUser(null)}
          >
            Show All
          </button>
        </div>
      )}

      <input
        placeholder="Search posts..."
        value={postSearch}
        onChange={(e) => setPostSearch(e.target.value)}
        style={{ width: "100%", marginBottom: "10px", padding: "8px" }}
      />

      <div style={{ display: "flex", gap: "10px", marginBottom: "20px" }}>
        <input
          style={{ flex: 1 }}
          placeholder="Write a post..."
          value={newPost}
          onChange={(e) => setNewPost(e.target.value)}
        />
        <button onClick={createPost}>Post</button>
      </div>

      {posts
        .filter(
          (post) =>
            post.content.toLowerCase().includes(postSearch.toLowerCase()) ||
            post.username.toLowerCase().includes(postSearch.toLowerCase()),
        )
        .map((post) => (
          <div
            key={post.id}
            style={{
              background: "white",
              padding: "10px",
              borderRadius: "10px",
              marginBottom: "10px",
              border: "2px solid #e5e7eb",
              boxShadow: "0 2px 5px rgba(0,0,0,0.1)",
            }}
          >
            <div style={{ display: "flex", justifyContent: "space-between" }}>
              <h4 style={{ margin: 0 }}>{post.username}</h4>
              <span style={{ fontSize: "12px", color: "gray" }}>
                {timeAgo(post.created_at)}
              </span>
            </div>

            <p style={{ margin: "5px 0" }}>{post.content}</p>

            <button onClick={() => likePost(post.id)}>
              👍 {post.likedByUser ? "Unlike" : "Like"}
            </button>
            <span style={{ marginLeft: "10px" }}>{post.likes} likes</span>

            <h4>Comments</h4>

            {(comments[post.id] || []).map((c) => (
              <div key={c.id} style={{ fontSize: "14px", marginBottom: "4px" }}>
                <div style={{ display: "flex", justifyContent: "space-between" }}>
                  <span>
                    <b>{c.username}</b>: {c.content}
                  </span>
                  <span style={{ fontSize: "11px", color: "gray" }}>
                    {timeAgo(c.created_at)}
                  </span>
                </div>
              </div>
            ))}

            <div style={{ display: "flex", gap: "5px", marginTop: "10px" }}>
              <input
                placeholder="Write comment..."
                value={newComments[post.id] || ""}
                onChange={(e) =>
                  setNewComments((prev) => ({
                    ...prev,
                    [post.id]: e.target.value,
                  }))
                }
              />
              <button onClick={() => addComment(post.id)}>Comment</button>
            </div>
          </div>
        ))}
    </div>
  );
}

export default Feed;