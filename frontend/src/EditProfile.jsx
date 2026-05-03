function EditProfile({
  username,
  setUsername,
  email,
  setEmail,
  oldPassword,
  setOldPassword,
  newPassword,
  setNewPassword,
  setProfileFile,
  updateProfile,
  setIsEditing,
}) {
  return (
    <div style={{ padding: "40px" }}>
      <h2>Rediger profil</h2>

      <input
        placeholder="Nyt brugernavn"
        value={username}
        onChange={(e) => setUsername(e.target.value)}
      />
      <br />
      <br />
      <input
        placeholder="Ny email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
      />
      <br />
      <br />
      <input
        type="password"
        placeholder="Old password"
        value={oldPassword}
        onChange={(e) => setOldPassword(e.target.value)}
      />

      <input
        type="password"
        placeholder="New password"
        value={newPassword}
        onChange={(e) => setNewPassword(e.target.value)}
      />
      <br />
      <br />
      <input
        type="file"
        accept="image/*"
        onChange={(e) => setProfileFile(e.target.files[0])}
      />
      <br />
      <br />
      <button onClick={updateProfile}>Gem ændringer</button>

      <button
        onClick={() => setIsEditing(false)}
        style={{ marginLeft: "10px" }}
      >
        Annuller
      </button>
    </div>
  );
}

export default EditProfile;