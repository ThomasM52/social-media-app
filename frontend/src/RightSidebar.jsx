function RightSidebar({
  friends,
  selectedUser,
  setSelectedUser,
  removeFriend,
  userSearch,
  setUserSearch,
  allUsers,
  addFriend,
  highlightMatch,
  user,
}) {
  return (
    <div
      style={{
        padding: "20px",
        borderLeft: "3px solid #d1d5db",
        background: "white",
      }}
    >
      <h3>Friends</h3>

      <h4>🟢 Online</h4>
      {friends
        .filter((f) => f.is_online)
        .map((f) => (
          <div
            key={f.id}
            onClick={() => setSelectedUser(f)}
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              cursor: "pointer",
              background:
                selectedUser?.id === f.id ? "#e0f2fe" : "transparent",
            }}
          >
            <div
              style={{ display: "flex", alignItems: "center", gap: "6px" }}
            >
              <span
                style={{
                  width: "10px",
                  height: "10px",
                  borderRadius: "50%",
                  background: "green",
                  display: "inline-block",
                }}
              />
              {f.username}
            </div>

            <button
              onClick={(e) => {
                e.stopPropagation();
                removeFriend(f.id);
              }}
              style={{
                background: "#ff4d4f",
                padding: "2px 6px",
                fontSize: "11px",
                borderRadius: "6px",
              }}
            >
              Remove
            </button>
          </div>
        ))}

      <h4 style={{ marginTop: "10px" }}>⚪ Offline</h4>
      {friends
        .filter((f) => !f.is_online)
        .map((f) => (
          <div
            key={f.id}
            onClick={() => setSelectedUser(f)}
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              cursor: "pointer",
              background:
                selectedUser?.id === f.id ? "#e0f2fe" : "transparent",
            }}
          >
            <div
              style={{ display: "flex", alignItems: "center", gap: "6px" }}
            >
              <span
                style={{
                  width: "10px",
                  height: "10px",
                  borderRadius: "50%",
                  background: "gray",
                  display: "inline-block",
                }}
              />
              {f.username}
            </div>

            <button
              onClick={(e) => {
                e.stopPropagation();
                removeFriend(f.id);
              }}
              style={{
                background: "#ff4d4f",
                padding: "2px 6px",
                fontSize: "11px",
                borderRadius: "6px",
              }}
            >
              Remove
            </button>
          </div>
        ))}

      <h3 style={{ marginTop: "20px" }}>Add Friends</h3>

      <input
        placeholder="Search users..."
        value={userSearch}
        onChange={(e) => setUserSearch(e.target.value)}
        style={{
          width: "100%",
          marginBottom: "10px",
          padding: "6px",
        }}
      />

      {userSearch &&
        allUsers.filter((u) =>
          u.username.toLowerCase().includes(userSearch.toLowerCase()),
        ).length === 0 && <p>No users found</p>}

      {allUsers
        .filter((u) =>
          u.username.toLowerCase().includes(userSearch.toLowerCase()),
        )
        .sort((a, b) =>
          a.username.toLowerCase().startsWith(userSearch.toLowerCase())
            ? -1
            : 1,
        )
        .filter((u) => Number(u.id) !== Number(user.id))
        .map((u) => {
          const isFriend = friends.some((f) => f.id === u.id);

          return (
            <div key={u.id}>
              {highlightMatch(u.username, userSearch)}
              {isFriend ? (
                <span style={{ marginLeft: "5px", color: "gray" }}>
                  (friend)
                </span>
              ) : (
                <button onClick={() => addFriend(u.id)}>Add</button>
              )}
            </div>
          );
        })}
    </div>
  );
}

export default RightSidebar;