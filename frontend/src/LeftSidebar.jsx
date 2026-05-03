function LeftSidebar({ user, logout, setIsEditing }) {
  return (
    <div
      style={{
        padding: "20px",
        borderRight: "3px solid #d1d5db",
        background: "white",
      }}
    >
      {user.profile_picture && (
        <img
          src={user.profile_picture}
          alt="profile"
          style={{
            width: "100px",
            height: "100px",
            borderRadius: "50%",
            objectFit: "cover",
            marginBottom: "10px",
            border: "3px solid #ddd",
          }}
        />
      )}

      <h2>{user.username}</h2>
      <button onClick={() => setIsEditing(true)}>Rediger profil</button>
      <br />
      <br />
      <button onClick={logout}>Logout</button>
    </div>
  );
}

export default LeftSidebar;