import { useState } from "react";
import { useNavigate, Link, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function AuthPage({ mode }) {
  const isLogin = mode === "login";
  const [form, setForm] = useState({ name: "", email: "", password: "" });
  const { login, register } = useAuth();
  const nav = useNavigate();
  const loc = useLocation();

  const submit = async (e) => {
    e.preventDefault();
    try {
      if (isLogin) await login({ email: form.email, password: form.password });
      else await register({ name: form.name, email: form.email, password: form.password });
      nav(loc.state?.from || "/dashboard");
    } catch (err) {
      alert(err?.response?.data?.message || "Auth failed");
    }
  };

  return (
    <div className="grid min-h-screen place-items-center bg-gradient-to-br from-indigo-600/20 to-cyan-500/20 p-4">
      <form onSubmit={submit} className="glass w-full max-w-md space-y-3 rounded-2xl p-6">
        <h1 className="text-2xl font-bold">{isLogin ? "Login" : "Register"} to BizFlow</h1>
        {!isLogin && (
          <input
            className="w-full rounded-lg border bg-transparent p-3"
            placeholder="Name"
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            required
          />
        )}
        <input
          className="w-full rounded-lg border bg-transparent p-3"
          placeholder="Email"
          type="email"
          value={form.email}
          onChange={(e) => setForm({ ...form, email: e.target.value })}
          required
        />
        <input
          className="w-full rounded-lg border bg-transparent p-3"
          type="password"
          placeholder="Password"
          value={form.password}
          onChange={(e) => setForm({ ...form, password: e.target.value })}
          required
        />
        {!isLogin && <p className="text-xs text-slate-500">New accounts are created as staff. Admins are seeded or promoted by your org.</p>}
        <button className="w-full rounded-lg bg-indigo-600 p-3 text-white">{isLogin ? "Login" : "Create account"}</button>
        <p className="text-center text-sm">
          {isLogin ? "No account?" : "Already have an account?"}{" "}
          <Link className="text-indigo-500" to={isLogin ? "/register" : "/login"}>
            {isLogin ? "Register" : "Login"}
          </Link>
        </p>
      </form>
    </div>
  );
}
