"use client";

import { useState, useEffect, useCallback } from "react";
import {
  getUsers,
  createUser,
  updateUser,
  deleteUser,
  GetUserDto,
  CreateUserDto,
  UpdateUserDto,
  PaginationMeta,
} from "@/lib/api";
import { DEFAULT_PAGE_SIZE } from "@/lib/constants";
import { errorMessage } from "@/lib/errors";
import Modal from "@/components/ui/Modal";
import Pagination from "@/components/ui/Pagination";
import { Button } from "@/components/ui/Button";
import { FieldLabel, FieldInput } from "@/components/ui/Field";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { RowAction } from "@/components/ui/RowAction";

const EMPTY_FORM: CreateUserDto = { email: "", password: "" };

type ModalKind = "create" | "edit" | "delete" | null;

export default function UsersTable() {
  const [users, setUsers] = useState<GetUserDto[]>([]);
  const [pagination, setPagination] = useState<PaginationMeta | null>(null);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const [modal, setModal] = useState<ModalKind>(null);
  const [selected, setSelected] = useState<GetUserDto | null>(null);
  const [form, setForm] = useState<CreateUserDto>(EMPTY_FORM);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [loadError, setLoadError] = useState("");

  const load = useCallback(async () => {
    setLoading(true);
    setLoadError("");
    try {
      const response = await getUsers(page, DEFAULT_PAGE_SIZE);
      setUsers(response.data ?? []);
      setPagination(response.pagination ?? null);
    } catch (cause) {
      setLoadError(errorMessage(cause));
    } finally {
      setLoading(false);
    }
  }, [page]);

  useEffect(() => { load(); }, [load]);

  function openCreate() {
    setForm(EMPTY_FORM);
    setError("");
    setModal("create");
  }

  function openEdit(user: GetUserDto) {
    setSelected(user);
    setForm({ email: user.email, password: "" });
    setError("");
    setModal("edit");
  }

  function openDelete(user: GetUserDto) {
    setSelected(user);
    setModal("delete");
  }

  async function handleCreate() {
    setSaving(true);
    setError("");
    try {
      await createUser(form);
      setModal(null);
      load();
    } catch (cause) {
      setError(errorMessage(cause));
    } finally {
      setSaving(false);
    }
  }

  async function handleUpdate() {
    if (!selected) return;
    setSaving(true);
    setError("");
    try {
      const dto: UpdateUserDto = {};
      if (form.email !== selected.email) dto.email = form.email;
      if (Object.keys(dto).length > 0) {
        await updateUser(selected.id, dto);
      }
      setModal(null);
      load();
    } catch (cause) {
      setError(errorMessage(cause));
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete() {
    if (!selected) return;
    setSaving(true);
    try {
      await deleteUser(selected.id);
      setModal(null);
      load();
    } catch (cause) {
      setError(errorMessage(cause));
    } finally {
      setSaving(false);
    }
  }

  const totalPages = pagination?.totalPagesCount ?? 0;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold text-gray-900 dark:text-white">Utilisateurs ({pagination?.totalItemsCount ?? 0})</h2>
        <Button onClick={openCreate} className="px-4 py-2 text-sm">
          + Ajouter un utilisateur
        </Button>
      </div>

      {loadError && (
        <p className="p-3 rounded-lg bg-red-50 border border-red-300 text-red-700 dark:bg-red-900 dark:border-red-800 dark:text-red-300 text-sm">
          {loadError}
        </p>
      )}

      {loading ? (
        <p className="text-gray-500 dark:text-gray-400">Chargement…</p>
      ) : (
        <div className="overflow-x-auto rounded-xl border border-gray-200 dark:border-gray-800">
          <table className="w-full text-sm table-fixed">
            <colgroup>
              <col className="w-[55%]" />
              <col className="w-[20%]" />
              <col className="w-[25%]" />
            </colgroup>
            <thead className="bg-gray-50 dark:bg-gray-900 text-gray-500 dark:text-gray-400 text-left">
              <tr>
                <th className="px-4 py-3">E-mail</th>
                <th className="px-4 py-3">Rôle</th>
                <th className="px-4 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
              {users.map((user) => (
                <tr key={user.id} className="hover:bg-gray-100 dark:hover:bg-gray-900/50">
                  <td className="px-4 py-3 truncate text-gray-900 dark:text-white">{user.email}</td>
                  <td className="px-4 py-3 truncate">
                    <StatusBadge variant="role">{user.role}</StatusBadge>
                  </td>
                  <td className="px-4 py-3 truncate text-right space-x-2">
                    <RowAction onClick={() => openEdit(user)}>Modifier</RowAction>
                    <RowAction variant="danger" onClick={() => openDelete(user)}>Supprimer</RowAction>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <Pagination page={page} totalPages={totalPages} onChange={setPage} />

      {(modal === "create" || modal === "edit") && (
        <Modal
          title={modal === "create" ? "Ajouter un utilisateur" : "Modifier un utilisateur"}
          onClose={() => setModal(null)}
        >
          <div className="space-y-3">
            <div>
              <FieldLabel compact>E-mail *</FieldLabel>
              <FieldInput
                type="email"
                required
                value={form.email}
                onChange={(event) => setForm({ ...form, email: event.target.value })}
                className="text-sm"
              />
            </div>
            {modal === "create" && (
              <div>
                <FieldLabel compact>Mot de passe *</FieldLabel>
                <FieldInput
                  type="password"
                  required
                  value={form.password}
                  onChange={(event) => setForm({ ...form, password: event.target.value })}
                  className="text-sm"
                />
              </div>
            )}
            {error && <p className="text-red-600 dark:text-red-400 text-sm">{error}</p>}
            <Button
              onClick={modal === "create" ? handleCreate : handleUpdate}
              disabled={saving}
              className="w-full py-2 text-sm"
            >
              {saving ? "Enregistrement…" : "Enregistrer"}
            </Button>
          </div>
        </Modal>
      )}

      {modal === "delete" && selected && (
        <Modal title="Supprimer un utilisateur" onClose={() => setModal(null)}>
          <div className="space-y-4">
            <p className="text-gray-600 dark:text-gray-300">
              Supprimer{" "}
              <span className="font-semibold text-gray-900 dark:text-white">{selected.email}</span> ?
              Cette action est irréversible.
            </p>
            {error && <p className="text-red-600 dark:text-red-400 text-sm">{error}</p>}
            <div className="flex gap-3">
              <Button variant="ghost" onClick={() => setModal(null)} className="flex-1 py-2 text-sm">
                Annuler
              </Button>
              <Button variant="danger" onClick={handleDelete} disabled={saving} className="flex-1 py-2 text-sm">
                {saving ? "Suppression…" : "Supprimer"}
              </Button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}
