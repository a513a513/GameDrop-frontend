import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";
import { Loader2, LogIn } from "lucide-react";

export const Route = createFileRoute("/login")({
  head: () => ({ meta: [{ title: "Login — GameDrop" }] }),
  component: LoginPage,
});

function LoginPage() {
  const navigate = useNavigate();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [errors, setErrors] = useState<{ username?: string; password?: string }>({});

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    const next: typeof errors = {};
    if (!username.trim()) next.username = "사용자 이름을 입력해주세요.";
    if (!password) next.password = "비밀번호를 입력해주세요.";
    setErrors(next);
    if (Object.keys(next).length) return;

    setSubmitting(true);
    
    try {
      // 🚀 [수정됨] 우리 백엔드 서버의 로그인 API를 호출합니다.
      const response = await fetch('https://gamedrop-backend.onrender.com/api/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          // 회원가입 때 email 형식을 `${username}@gamedrop.com`으로 저장했으므로 동일하게 맞춰줍니다.
          email: `${username.trim()}@gamedrop.com`,
          password: password,
        }),
      });

      const result = await response.json();

      if (response.ok) {
        toast.success(`반가워요, ${username}님!`);
        // 로그인 성공 시 메인 화면으로 이동
        navigate({ to: "/" });
      } else {
        // 서버에서 보낸 에러 메시지 (아이디/비번 불일치 등) 표시
        toast.error(result.error || "로그인에 실패했습니다.");
      }
    } catch (err) {
      toast.error("서버와 연결할 수 없습니다. 백엔드 서버를 확인해주세요.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="mx-auto max-w-md py-10">
      <div className="rounded-2xl border border-white/10 bg-zinc-900/60 p-8 backdrop-blur">
        <h1 className="text-2xl font-extrabold tracking-tight">다시 오셨군요!</h1>
        <p className="mt-1 text-sm text-white/60">모험을 계속하려면 로그인하세요.</p>
        <form onSubmit={onSubmit} className="mt-6 space-y-4">
          <Field label="Username" error={errors.username}>
            <input
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full rounded-lg bg-zinc-950 px-4 py-2.5 text-sm ring-1 ring-white/10 focus:outline-none focus:ring-[var(--neon)]"
              autoComplete="username"
            />
          </Field>
          <Field label="Password" error={errors.password}>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full rounded-lg bg-zinc-950 px-4 py-2.5 text-sm ring-1 ring-white/10 focus:outline-none focus:ring-[var(--neon)]"
              autoComplete="current-password"
            />
          </Field>
          <button
            type="submit"
            disabled={submitting}
            className="flex w-full items-center justify-center gap-2 rounded-lg bg-[var(--neon)] px-4 py-2.5 text-sm font-bold text-black transition hover:shadow-[var(--neon-glow)] disabled:opacity-60"
          >
            {submitting ? <Loader2 className="h-4 w-4 animate-spin" /> : <LogIn className="h-4 w-4" />}
            {submitting ? "로그인 중..." : "로그인"}
          </button>
        </form>
        <p className="mt-6 text-center text-sm text-white/60">
          처음이신가요?{" "}
          <Link to="/signup" className="font-semibold text-[var(--neon)] hover:underline">
            계정 만들기
          </Link>
        </p>
      </div>
    </div>
  );
}

function Field({ label, error, children }: { label: string; error?: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-white/70">{label}</span>
      {children}
      {error && <span className="mt-1 block text-xs text-red-400">{error}</span>}
    </label>
  );
}