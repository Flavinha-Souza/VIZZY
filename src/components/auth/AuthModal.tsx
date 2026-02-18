import { FormEvent, useEffect, useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Eye, EyeOff, X } from "lucide-react";
import { toast } from "sonner";
import { getUsers, saveSession, saveUsers } from "@/lib/storage";
import { AuthSession, AuthUser } from "@/types/auth";

interface AuthModalProps {
  open: boolean;
  onClose: () => void;
  onAuthenticated: (session: AuthSession) => void;
}

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const MIN_PASSWORD_LENGTH = 6;

const toHex = (bytes: Uint8Array) =>
  Array.from(bytes)
    .map((byte) => byte.toString(16).padStart(2, "0"))
    .join("");

const hashPassword = async (rawPassword: string) => {
  if (!globalThis.crypto?.subtle) {
    let hash = 0;
    for (let i = 0; i < rawPassword.length; i += 1) {
      hash = (hash << 5) - hash + rawPassword.charCodeAt(i);
      hash |= 0;
    }
    return `fallback:${Math.abs(hash).toString(16)}`;
  }

  const encoder = new TextEncoder();
  const data = encoder.encode(rawPassword);
  const hashBuffer = await crypto.subtle.digest("SHA-256", data);
  return `sha256:${toHex(new Uint8Array(hashBuffer))}`;
};

const isStrongPassword = (rawPassword: string) => {
  return rawPassword.length >= MIN_PASSWORD_LENGTH;
};

const AuthModal = ({ open, onClose, onAuthenticated }: AuthModalProps) => {
  const [mode, setMode] = useState<"login" | "register" | "reset">("login");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [errors, setErrors] = useState<{
    name?: string;
    email?: string;
    password?: string;
  }>({});

  const isRegister = useMemo(() => mode === "register", [mode]);
  const isReset = useMemo(() => mode === "reset", [mode]);

  useEffect(() => {
    if (!open) return;
    setMode("login");
    setName("");
    setEmail("");
    setPassword("");
    setShowPassword(false);
    setSubmitting(false);
    setErrors({});
  }, [open]);

  const resetForm = () => {
    setName("");
    setEmail("");
    setPassword("");
    setShowPassword(false);
    setSubmitting(false);
    setErrors({});
  };

  const closeModal = () => {
    resetForm();
    onClose();
  };

  const validateFields = (isRegisterMode: boolean, isResetMode: boolean) => {
    const nextErrors: {
      name?: string;
      email?: string;
      password?: string;
    } = {};

    if (isRegisterMode && !name.trim()) {
      nextErrors.name = "Informe seu nome.";
    }

    const normalizedEmail = email.trim().toLowerCase();
    if (!normalizedEmail) {
      nextErrors.email = "Informe um e-mail.";
    } else if (!EMAIL_PATTERN.test(normalizedEmail)) {
      nextErrors.email = "Informe um e-mail v\u00E1lido.";
    }

    if (!password.trim()) {
      nextErrors.password = "Informe uma senha.";
    } else if ((isRegisterMode || isResetMode) && !isStrongPassword(password.trim())) {
      nextErrors.password = "M\u00EDnimo 6 caracteres.";
    }

    return nextErrors;
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (submitting) return;

    const normalizedEmail = email.trim().toLowerCase();
    const rawPassword = password.trim();

    const fieldErrors = validateFields(isRegister, isReset);
    setErrors(fieldErrors);
    if (Object.keys(fieldErrors).length > 0) {
      toast.error("Revise os campos destacados.");
      return;
    }

    const users = getUsers();
    setSubmitting(true);

    try {
      if (isReset) {
        const user = users.find((item) => item.email === normalizedEmail);
        if (!user) {
          setErrors((prev) => ({ ...prev, email: "E-mail n\u00E3o encontrado." }));
          toast.error("E-mail n\u00E3o encontrado.");
          return;
        }

        const passwordHash = await hashPassword(rawPassword);
        const updatedUsers = users.map((item) =>
          item.email === user.email
            ? { ...item, passwordHash, passwordLegacy: undefined, password: undefined }
            : item,
        );
        saveUsers(updatedUsers);
        setPassword("");
        setShowPassword(false);
        setErrors({});
        setMode("login");
        toast.success("Senha redefinida. Fa\u00E7a login com a nova senha.");
        return;
      }

      if (isRegister) {
        const existing = users.find((user) => user.email === normalizedEmail);
        if (existing) {
          setErrors((prev) => ({ ...prev, email: "Este e-mail j\u00E1 est\u00E1 cadastrado." }));
          toast.error("Este e-mail j\u00E1 est\u00E1 cadastrado.");
          return;
        }

        const passwordHash = await hashPassword(rawPassword);
        const newUser: AuthUser = {
          name: name.trim(),
          email: normalizedEmail,
          passwordHash,
        };

        saveUsers([...users, newUser]);

        const session: AuthSession = {
          name: newUser.name,
          email: newUser.email,
        };
        saveSession(session);

        toast.success("Conta criada com sucesso.");
        onAuthenticated(session);
        closeModal();
        return;
      }

      const user = users.find((item) => item.email === normalizedEmail);
      if (!user) {
        setErrors((prev) => ({ ...prev, email: "E-mail ou senha inv\u00E1lidos." }));
        toast.error("E-mail ou senha inv\u00E1lidos.");
        return;
      }

      const incomingHash = await hashPassword(rawPassword);
      const isHashedMatch = user.passwordHash === incomingHash;
      const isLegacyMatch =
        (typeof user.passwordLegacy === "string" && user.passwordLegacy === rawPassword) ||
        (typeof user.password === "string" && user.password === rawPassword);

      if (!isHashedMatch && !isLegacyMatch) {
        setErrors((prev) => ({ ...prev, password: "E-mail ou senha inv\u00E1lidos." }));
        toast.error("E-mail ou senha inv\u00E1lidos.");
        return;
      }

      if (isLegacyMatch) {
        const migratedUsers = users.map((item) =>
          item.email === user.email
            ? {
                ...item,
                passwordHash: incomingHash,
                passwordLegacy: undefined,
                password: undefined,
              }
            : item,
        );
        saveUsers(migratedUsers);
      }

      const session: AuthSession = {
        name: user.name,
        email: user.email,
      };
      saveSession(session);

      toast.success("Login realizado.");
      onAuthenticated(session);
      closeModal();
    } catch {
      toast.error("N\u00E3o foi poss\u00EDvel concluir a opera\u00E7\u00E3o. Tente novamente.");
    } finally {
      setSubmitting(false);
    }
  };

  const inputClass = (hasError?: boolean) =>
    `w-full rounded-[14px] border px-4 py-2.5 md:py-3 text-[14px] md:text-[15px] text-slate-200 bg-[#2a3344] placeholder:text-slate-400/80 transition-colors outline-none focus:border-cyan-400/60 ${
      hasError ? "border-red-500/70" : "border-transparent"
    }`;

  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/55 backdrop-blur-sm"
            onClick={closeModal}
          />

          <motion.div
            initial={{ opacity: 0, y: 18, scale: 0.985 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 18, scale: 0.985 }}
            transition={{ duration: 0.24, ease: "easeOut" }}
            className="fixed inset-0 z-50 flex items-center justify-center p-3 md:p-6"
          >
            <div className="pointer-events-auto w-full max-h-[90dvh] overflow-y-auto rounded-[20px] border border-slate-700/30 bg-[#040b1a] px-4 py-5 text-slate-100 md:max-w-[460px] md:px-6 md:py-6">
              <div className="mb-5 flex items-start justify-between md:mb-6">
                <h2 className="text-[22px] leading-none tracking-[0.08em] text-slate-100 md:text-[28px]">
                  {isRegister ? "CRIAR CONTA" : isReset ? "REDEFINIR SENHA" : "ENTRAR"}
                </h2>
                <button
                  onClick={closeModal}
                  className="rounded-md p-2 text-slate-400 transition hover:text-slate-200"
                  aria-label="Fechar modal de autentica\u00E7\u00E3o"
                >
                  <X size={24} strokeWidth={1.5} />
                </button>
              </div>

              <AnimatePresence mode="wait" initial={false}>
                <motion.form
                  key={mode}
                  onSubmit={handleSubmit}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -8 }}
                  transition={{ duration: 0.22, ease: "easeInOut" }}
                  className="space-y-3.5 md:space-y-4"
                >
                  {isRegister && (
                    <div className="space-y-1.5">
                      <label htmlFor="auth-name" className="text-[14px] text-slate-400">
                        Nome
                      </label>
                      <input
                        id="auth-name"
                        type="text"
                        value={name}
                        onChange={(e) => {
                          setName(e.target.value);
                          if (errors.name) setErrors((prev) => ({ ...prev, name: undefined }));
                        }}
                        placeholder="Seu nome"
                        className={inputClass(!!errors.name)}
                        aria-invalid={!!errors.name}
                        aria-describedby={errors.name ? "auth-name-error" : undefined}
                      />
                      {errors.name && (
                        <p id="auth-name-error" className="text-sm text-red-400">
                          {errors.name}
                        </p>
                      )}
                    </div>
                  )}

                  <div className="space-y-1.5">
                    <label htmlFor="auth-email" className="text-[14px] text-slate-400">
                      Email
                    </label>
                    <input
                      id="auth-email"
                      type="email"
                      value={email}
                      onChange={(e) => {
                        setEmail(e.target.value);
                        if (errors.email) setErrors((prev) => ({ ...prev, email: undefined }));
                      }}
                      placeholder="seu@email.com"
                      className={inputClass(!!errors.email)}
                      aria-invalid={!!errors.email}
                      aria-describedby={errors.email ? "auth-email-error" : undefined}
                      autoComplete="email"
                    />
                    {errors.email && (
                      <p id="auth-email-error" className="text-sm text-red-400">
                        {errors.email}
                      </p>
                    )}
                  </div>

                  <div className="space-y-1.5">
                    <label htmlFor="auth-password" className="text-[14px] text-slate-400">
                      Senha
                    </label>
                    <div className="relative">
                      <input
                        id="auth-password"
                        type={showPassword ? "text" : "password"}
                        value={password}
                        onChange={(e) => {
                          setPassword(e.target.value);
                          if (errors.password) {
                            setErrors((prev) => ({ ...prev, password: undefined }));
                          }
                        }}
                        placeholder={isRegister || isReset ? "Crie uma nova senha" : "Sua senha"}
                        className={`${inputClass(!!errors.password)} pr-14`}
                        aria-invalid={!!errors.password}
                        aria-describedby={
                          errors.password
                            ? "auth-password-error"
                            : isRegister || isReset
                              ? "auth-password-hint"
                              : undefined
                        }
                        autoComplete={isRegister ? "new-password" : "current-password"}
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword((prev) => !prev)}
                        className="absolute inset-y-0 right-0 inline-flex items-center px-5 text-slate-400 transition hover:text-slate-200"
                        aria-label={showPassword ? "Ocultar senha" : "Mostrar senha"}
                      >
                        {showPassword ? <Eye size={18} /> : <EyeOff size={18} />}
                      </button>
                    </div>
                    {(isRegister || isReset) && !errors.password && (
                      <p id="auth-password-hint" className="text-[12px] text-slate-400">
                        {"M\u00EDnimo 6 caracteres."}
                      </p>
                    )}
                    {errors.password && (
                      <p id="auth-password-error" className="text-sm text-red-400">
                        {errors.password}
                      </p>
                    )}
                  </div>

                  <button
                    type="submit"
                    disabled={submitting}
                    className="mt-1 w-full rounded-[14px] bg-[#38d7cd] px-6 py-3 text-[16px] font-medium text-[#061223] transition duration-200 hover:brightness-95 disabled:cursor-not-allowed disabled:opacity-70 md:text-[17px]"
                  >
                    {submitting
                      ? "Processando..."
                      : isRegister
                        ? "Criar e entrar"
                        : isReset
                          ? "Redefinir senha"
                          : "Entrar"}
                  </button>
                </motion.form>
              </AnimatePresence>

              <div className="mt-5 border-t border-slate-600/55 pt-4 md:mt-6">
                {!isRegister && !isReset && (
                  <button
                    type="button"
                    className="block text-[14px] text-[#38d7cd] transition hover:opacity-90 md:text-[15px]"
                    onClick={() => {
                      setMode("reset");
                      setPassword("");
                      setShowPassword(false);
                      setErrors({});
                    }}
                  >
                    Esqueci minha senha
                  </button>
                )}

                {!isReset && (
                  <button
                    onClick={() => {
                      setMode(isRegister ? "login" : "register");
                      setPassword("");
                      setShowPassword(false);
                      setErrors({});
                    }}
                    className={`block text-left text-[14px] text-[#38d7cd] underline underline-offset-4 transition hover:opacity-90 md:text-[15px] ${
                      isRegister ? "mt-0" : "mt-4"
                    }`}
                  >
                    {isRegister
                      ? "J\u00E1 tem conta? Entrar"
                      : "Ainda n\u00E3o tem conta? Criar cadastro"}
                  </button>
                )}

                {isReset && (
                  <button
                    type="button"
                    onClick={() => {
                      setMode("login");
                      setPassword("");
                      setShowPassword(false);
                      setErrors({});
                    }}
                    className="mt-4 block text-left text-[14px] text-[#38d7cd] underline underline-offset-4 transition hover:opacity-90 md:text-[15px]"
                  >
                    Voltar para login
                  </button>
                )}

                <p className="mt-5 max-w-[420px] text-[12px] leading-relaxed text-slate-400 md:text-[13px]">
                  {
                    "Ao continuar, voc\u00EA concorda com os Termos de Uso e a Pol\u00EDtica de Privacidade."
                  }
                </p>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

export default AuthModal;



