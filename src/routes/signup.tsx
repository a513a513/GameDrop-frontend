import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";
import { Loader2, UserPlus } from "lucide-react";
import { LegalModal } from "@/components/LegalModal";

export const Route = createFileRoute("/signup")({
  head: () => ({ meta: [{ title: "Sign Up — GameDrop" }] }),
  component: SignupPage,
});

function SignupPage() {
  const navigate = useNavigate();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [agreeTerms, setAgreeTerms] = useState(false);
  const [agreePrivacy, setAgreePrivacy] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);
  const [legal, setLegal] = useState<"terms" | "privacy" | null>(null);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    const next: Record<string, string> = {};
    if (!username.trim()) next.username = "사용자 이름을 입력해주세요.";
    else if (username.trim().length < 3) next.username = "최소 3자 이상이어야 합니다.";
    if (!password) next.password = "비밀번호를 입력해주세요.";
    else if (password.length < 6) next.password = "최소 6자 이상이어야 합니다.";
    if (!confirm) next.confirm = "비밀번호 확인을 입력해주세요.";
    else if (password && confirm !== password) next.confirm = "비밀번호가 일치하지 않습니다.";
    if (!agreeTerms || !agreePrivacy) next.terms = "약관에 동의해야 합니다.";
    
    setErrors(next);
    if (Object.keys(next).length) return;

    setSubmitting(true);
    
    try {
      // 🚀 [수정됨] 우리가 만든 백엔드 서버로 직접 통신합니다!
      const response = await fetch('https://gamedrop-backend.onrender.com/api/signup', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: `${username.trim()}@gamedrop.com`, // 임시 이메일 형식
          password: password,
          nickname: username.trim(),
        }),
      });

      const result = await response.json();

      if (response.ok) {
        toast.success("회원가입이 완료되었습니다! 로그인해주세요.", { duration: 1500 });
        setTimeout(() => navigate({ to: "/login" }), 1500);
      } else {
        // 백엔드에서 보낸 에러 메시지 표시 (예: 이미 존재하는 아이디 등)
        toast.error(`가입 실패: ${result.error}`);
        setSubmitting(false);
      }
    } catch (err) {
      toast.error("서버와 통신할 수 없습니다. 백엔드 서버가 켜져 있는지 확인하세요.");
      setSubmitting(false);
    }
  }

  return (
    <div className="mx-auto max-w-md py-10">
      <div className="rounded-2xl border border-white/10 bg-zinc-900/60 p-8 backdrop-blur">
        <h1 className="text-2xl font-extrabold tracking-tight">계정 만들기</h1>
        <p className="mt-1 text-sm text-white/60">GameDrop에 가입하여 최신 게임 소식을 놓치지 마세요.</p>
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
              autoComplete="new-password"
            />
          </Field>
          <Field label="Confirm Password" error={errors.confirm}>
            <input
              type="password"
              value={confirm}
              onChange={(e) => setConfirm(e.target.value)}
              className="w-full rounded-lg bg-zinc-950 px-4 py-2.5 text-sm ring-1 ring-white/10 focus:outline-none focus:ring-[var(--neon)]"
              autoComplete="new-password"
            />
          </Field>

          <div className="space-y-2 rounded-lg bg-zinc-950/50 p-3 ring-1 ring-white/5">
            <Consent
              checked={agreeTerms}
              onChange={setAgreeTerms}
              label="이용 약관"
              onOpen={() => setLegal("terms")}
            />
            <Consent
              checked={agreePrivacy}
              onChange={setAgreePrivacy}
              label="개인정보 처리방침"
              onOpen={() => setLegal("privacy")}
            />
            {errors.terms && <span className="block text-xs text-red-400">{errors.terms}</span>}
          </div>

          <button
            type="submit"
            disabled={submitting}
            className="flex w-full items-center justify-center gap-2 rounded-lg bg-[var(--neon)] px-4 py-2.5 text-sm font-bold text-black transition hover:shadow-[var(--neon-glow)] disabled:opacity-60"
          >
            {submitting ? <Loader2 className="h-4 w-4 animate-spin" /> : <UserPlus className="h-4 w-4" />}
            {submitting ? "가입 중..." : "가입하기"}
          </button>
        </form>
        <p className="mt-6 text-center text-sm text-white/60">
          이미 계정이 있으신가요?{" "}
          <Link to="/login" className="font-semibold text-[var(--neon)] hover:underline">
            로그인
          </Link>
        </p>
      </div>
      <LegalModal open={legal !== null} onClose={() => setLegal(null)} kind={legal} />
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

function Consent({
  checked, onChange, label, onOpen,
}: { checked: boolean; onChange: (v: boolean) => void; label: string; onOpen: () => void }) {
  return (
    <label className="flex items-center gap-2 text-sm text-white/80">
      <input
        type="checkbox"
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
        className="h-4 w-4 accent-[var(--neon)]"
      />
      <span>
        동의합니다:{" "}
        <button type="button" onClick={onOpen} className="font-semibold text-[var(--neon)] hover:underline">
          {label}
        </button>
      </span>
    </label>
  );
}