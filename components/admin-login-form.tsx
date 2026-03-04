"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { useMutation } from "@tanstack/react-query";
import { loginAdminAction } from "@/app/admin/actions";

const GENERIC_ERROR = "Não foi possível autenticar. Tente novamente.";
const CREDENTIALS_ERROR = "Senha inválida.";
const CONFIG_ERROR = "Autenticação admin não configurada no ambiente.";

function getErrorMessage(error: unknown) {
  const code = error instanceof Error ? error.message : "";
  if (code === "INVALID_CREDENTIALS") return CREDENTIALS_ERROR;
  if (code === "ADMIN_AUTH_NOT_CONFIGURED") return CONFIG_ERROR;
  return GENERIC_ERROR;
}

export function AdminLoginForm() {
  const router = useRouter();
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const loginMutation = useMutation({
    mutationFn: async (candidatePassword: string) => {
      const result = await loginAdminAction(candidatePassword);
      if (!result.ok) {
        throw new Error(result.code);
      }
      return result;
    },
    onSuccess: () => {
      router.replace("/admin");
      router.refresh();
    },
  });

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError("");
    loginMutation.mutate(password, {
      onError: (mutationError) => {
        setError(getErrorMessage(mutationError));
      },
    });
  };

  return (
    <form className="flex w-full flex-col gap-4" onSubmit={handleSubmit}>
      <div className="space-y-1">
        <h1 className="text-2xl font-semibold tracking-tight text-zinc-950">Numa Admin</h1>
      </div>

      <label className="space-y-2 text-sm font-medium text-zinc-900" htmlFor="admin-password">
        Senha
        <input
          id="admin-password"
          name="password"
          type="password"
          autoComplete="current-password"
          required
          value={password}
          onChange={(event) => {
            setPassword(event.target.value);
            if (error) setError("");
          }}
          className="h-11 w-full rounded-md border border-zinc-300 bg-white px-3 text-zinc-900 outline-none transition focus:border-zinc-800 focus:ring-2 focus:ring-zinc-200"
        />
      </label>

      {error && (
        <p className="rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700" role="alert">
          {error}
        </p>
      )}

      <button
        type="submit"
        disabled={loginMutation.isPending}
        className="h-11 rounded-md bg-zinc-950 px-4 text-sm font-semibold text-white transition hover:bg-zinc-800 disabled:cursor-not-allowed disabled:opacity-70"
      >
        {loginMutation.isPending ? "Entrando..." : "Entrar"}
      </button>
    </form>
  );
}
