import { FormEvent, useEffect, useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { X } from "lucide-react";
import { toast } from "sonner";

interface AuthUser {
  name: string;
  email: string;
  password: string;
}

interface AuthSession {
  name: string;
  email: string;
}

interface AuthModalProps {
  open: boolean;
  onClose: () => void;
  onAuthenticated: (session: AuthSession) => void;
}

const USERS_KEY = "vizzy_users";
const SESSION_KEY = "vizzy_current_user";

const getUsers = (): AuthUser[] => {
  try {
    return JSON.parse(localStorage.getItem(USERS_KEY) || "[]");
  } catch {
    return [];
  }
};

const AuthModal = ({ open, onClose, onAuthenticated }: AuthModalProps) => {
  const [mode, setMode] = useState<"login" | "register">("login");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const isRegister = useMemo(() => mode === "register", [mode]);

  useEffect(() => {
    if (!open) return;
    setMode("login");
    setName("");
    setEmail("");
    setPassword("");
  }, [open]);

  const resetForm = () => {
    setName("");
    setEmail("");
    setPassword("");
  };

  const closeModal = () => {
    resetForm();
    onClose();
  };

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();

    const normalizedEmail = email.trim().toLowerCase();
    if (!normalizedEmail || !password.trim()) {
      toast.error("Preencha email e senha.");
      return;
    }

    const users = getUsers();

    if (isRegister) {
      if (!name.trim()) {
        toast.error("Preencha seu nome.");
        return;
      }

      const existing = users.find((user) => user.email === normalizedEmail);
      if (existing) {
        toast.error("Este email já está cadastrado.");
        return;
      }

      const newUser: AuthUser = {
        name: name.trim(),
        email: normalizedEmail,
        password,
      };

      const updatedUsers = [...users, newUser];
      localStorage.setItem(USERS_KEY, JSON.stringify(updatedUsers));

      const session: AuthSession = {
        name: newUser.name,
        email: newUser.email,
      };
      localStorage.setItem(SESSION_KEY, JSON.stringify(session));

      toast.success("Conta criada com sucesso.");
      onAuthenticated(session);
      closeModal();
      return;
    }

    const user = users.find((item) => item.email === normalizedEmail);
    if (!user || user.password !== password) {
      toast.error("Email ou senha inválidos.");
      return;
    }

    const session: AuthSession = {
      name: user.name,
      email: user.email,
    };
    localStorage.setItem(SESSION_KEY, JSON.stringify(session));

    toast.success("Login realizado.");
    onAuthenticated(session);
    closeModal();
  };

  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/45 backdrop-blur-sm"
            onClick={closeModal}
          />

          <motion.div
            initial={{ opacity: 0, scale: 0.96, y: 24 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96, y: 24 }}
            transition={{ type: "spring", stiffness: 260, damping: 24 }}
            className="
              fixed inset-0 z-50 flex items-center justify-center
              p-4 md:p-6
            "
          >
            <div
              className="
                pointer-events-auto border border-border bg-black shadow-2xl
                w-full max-w-md md:w-[92vw] md:max-w-lg
                max-h-[88dvh] md:max-h-[90dvh] overflow-y-auto
                rounded-2xl
                px-5 py-5 md:px-7 md:py-6
                pb-[max(1.25rem,env(safe-area-inset-bottom))]
              "
            >
              <div className="mb-4 flex items-center justify-between">
                <h2 className="text-sm font-mono uppercase tracking-wider text-muted-foreground">
                  {isRegister ? "Criar Conta" : "Entrar"}
                </h2>
                <button
                  onClick={closeModal}
                  className="rounded-md p-2 transition hover:bg-secondary"
                >
                  <X size={16} />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="space-y-3 md:space-y-3.5">
                {isRegister && (
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Seu nome"
                    className="w-full rounded-lg border border-border bg-background px-3 py-2.5 text-base md:text-sm outline-none transition focus:border-primary/60"
                  />
                )}

                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Email"
                  className="w-full rounded-lg border border-border bg-background px-3 py-2.5 text-base md:text-sm outline-none transition focus:border-primary/60"
                />

                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Senha"
                  className="w-full rounded-lg border border-border bg-background px-3 py-2.5 text-base md:text-sm outline-none transition focus:border-primary/60"
                />

                <button
                  type="submit"
                  className="w-full rounded-lg bg-primary px-3 py-2.5 text-sm md:text-xs font-mono text-primary-foreground transition hover:opacity-90"
                >
                  {isRegister ? "Criar e entrar" : "Entrar"}
                </button>
              </form>

              <button
                onClick={() => setMode(isRegister ? "login" : "register")}
                className="mt-4 text-sm md:text-xs font-medium text-primary transition hover:opacity-80"
              >
                {isRegister
                  ? "Já tem conta? Entrar"
                  : "Ainda não tem conta? Criar cadastro"}
              </button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

export default AuthModal;
