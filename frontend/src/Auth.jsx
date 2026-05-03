function Auth({
  username,
  setUsername,
  password,
  setPassword,
  email,
  setEmail,
  isRegistering,
  setIsRegistering,
  rememberMe,
  setRememberMe,
  setProfileFile,
  handleSubmit,
}) {
  return (
    <div style={{ padding: "40px" }}>
      <h2>{isRegistering ? "Register" : "Login"}</h2>

      <input
        placeholder="Username"
        value={username}
        onChange={(e) => setUsername(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === "Enter") handleSubmit();
        }}
      />

      <br />
      {isRegistering && (
        <>
          <input
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") handleSubmit();
            }}
          />
          <br />
          <input
            type="file"
            accept="image/*"
            onChange={(e) => setProfileFile(e.target.files[0])}
          />
          <br />
        </>
      )}

      <input
        type="password"
        placeholder="Password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === "Enter") handleSubmit();
        }}
      />

      <label style={{ display: "block", marginTop: "10px" }}>
        <input
          type="checkbox"
          checked={rememberMe}
          onChange={(e) => setRememberMe(e.target.checked)}
        />
        Remember me
      </label>

      <br />
      <button onClick={handleSubmit}>
        {isRegistering ? "Create account" : "Login"}
      </button>

      <button
        style={{ marginLeft: "10px" }}
        onClick={() => setIsRegistering(!isRegistering)}
      >
        {isRegistering ? "Back to login" : "Register"}
      </button>
    </div>
  );
}

export default Auth;