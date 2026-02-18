import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Trash2, LogOut, X } from "lucide-react";
import { toast } from "sonner";
import { clearSession, getUsers, saveSession, saveUsers } from "@/lib/storage";
import { AuthSession } from "@/types/auth";

interface AccountModalProps {
  open: boolean;
  session: AuthSession | null;
  onClose: () => void;
  onSessionChange: (session: AuthSession | null) => void;
}

const AccountModal = ({
  open,
  session,
  onClose,
  onSessionChange,
}: AccountModalProps) => {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");

  useEffect(() => {
    if (!open || !session) return;
    setName(session.name);
    setEmail(session.email);
  }, [open, session]);

  const handleSave = () => {
    if (!session) return;

    const trimmedName = name.trim();
    const normalizedEmail = email.trim().toLowerCase();

    if (!trimmedName || !normalizedEmail) {
      toast.error("Preencha nome e email.");
      return;
    }

    const users = getUsers();
    const duplicated = users.find(
      (user) => user.email === normalizedEmail && user.email !== session.email,
    );

    if (duplicated) {
      toast.error("Este email já está em uso.");
      return;
    }

    const updatedUsers = users.map((user) =>
      user.email === session.email
        ? { ...user, name: trimmedName, email: normalizedEmail }
        : user,
    );

    saveUsers(updatedUsers);

    const nextSession: AuthSession = { name: trimmedName, email: normalizedEmail };
    saveSession(nextSession);
    onSessionChange(nextSession);

    toast.success("Perfil atualizado.");
    onClose();
  };

  const handleLogout = () => {
    clearSession();
    onSessionChange(null);
    toast.success("Você saiu da conta.");
    onClose();
  };

  const handleDeleteAccount = () => {
    if (!session) return;
    const confirmed = window.confirm("Deseja excluir sua conta? Esta ação não pode ser desfeita.");
    if (!confirmed) return;

    const users = getUsers().filter((user) => user.email !== session.email);
    saveUsers(users);
    clearSession();
    onSessionChange(null);

    toast.success("Conta excluída.");
    onClose();
  };

  if (!session) return null;

  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/45 backdrop-blur-sm"
            onClick={onClose}
          />

          <motion.div
            initial={{ opacity: 0, scale: 0.96, y: 18 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96, y: 18 }}
            transition={{ type: "spring", stiffness: 280, damping: 24 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 md:p-6"
          >
            <div className="w-full max-w-md rounded-2xl border border-border bg-black p-5 md:p-6 shadow-2xl">
              <div className="mb-4 flex items-center justify-between">
                <h2 className="text-sm font-mono uppercase tracking-wider text-muted-foreground">
                  Minha Conta
                </h2>
                <button onClick={onClose} className="rounded-md p-2 transition hover:bg-secondary">
                  <X size={16} />
                </button>
              </div>

              <div className="space-y-3">
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Nome"
                  className="w-full rounded-lg border border-border bg-background px-3 py-2.5 text-sm outline-none transition focus:border-primary/60"
                />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Email"
                  className="w-full rounded-lg border border-border bg-background px-3 py-2.5 text-sm outline-none transition focus:border-primary/60"
                />

                <button
                  onClick={handleSave}
                  className="w-full rounded-lg bg-primary px-3 py-2.5 text-xs font-mono text-primary-foreground transition hover:opacity-90"
                >
                  Salvar alterações
                </button>

                <button
                  onClick={handleLogout}
                  className="w-full rounded-lg border border-border px-3 py-2.5 text-xs font-mono transition hover:bg-secondary/60"
                >
                  <span className="inline-flex items-center gap-2">
                    <LogOut size={14} />
                    Sair da conta
                  </span>
                </button>

                <button
                  onClick={handleDeleteAccount}
                  className="w-full rounded-lg border border-destructive/45 px-3 py-2.5 text-xs font-mono text-destructive transition hover:bg-destructive/10"
                >
                  <span className="inline-flex items-center gap-2">
                    <Trash2 size={14} />
                    Excluir conta
                  </span>
                </button>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

export default AccountModal;
